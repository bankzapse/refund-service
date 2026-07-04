-- ============================================================
-- Migration: credit / partner model (โมเดลเครดิต + ค่าคอม 2%)
-- ปลอดภัย · ไม่ลบข้อมูลเดิม · รันซ้ำได้ (idempotent)
--
-- เปลี่ยนจาก "ค่าบริการ 5% หักจากผู้ขาย" → "ผู้ขายได้เต็ม + บริษัทเก็บค่าคอม 2%
-- โดยหักจากเครดิตของผู้รับซื้อ (พาร์ทเนอร์) · ต้องมีเครดิต ≥ 300 ถึงจะออกบิลได้"
--
-- วิธีใช้: รันไฟล์นี้กับฐานข้อมูลที่มี schema.sql เดิมอยู่แล้ว
--   supabase db push   (หรือ)   psql "$DATABASE_URL" -f this_file.sql
-- ============================================================

begin;

-- 1) คอลัมน์เครดิต + สถานะพาร์ทเนอร์ บน profiles
alter table profiles add column if not exists credit  numeric not null default 0;
alter table profiles add column if not exists partner boolean not null default false;

-- NB: ผู้รับซื้อเดิมจะเริ่มด้วยเครดิต 0 → ต้องเติมก่อนถึงจะรับงาน/ออกบิลได้
--     (จงใจ ไม่แจกเครดิตฟรี) · ถ้าต้องการตั้งเป็นพาร์ทเนอร์ทั้งหมด ให้ยกเลิกคอมเมนต์บรรทัดล่าง:
-- update profiles set partner = true where role = 'buyer';

-- 2) ตารางธุรกรรมเครดิต (wallet)
create table if not exists wallet_transactions (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid not null references profiles(id) on delete cascade,
  type           text not null,                     -- topup | commission | adjust
  amount         numeric not null,                  -- + เข้า, − ออก
  balance_after  numeric not null default 0,
  note           text,
  job_id         uuid,                              -- อ้างอิงงาน (ไม่บังคับ FK)
  created_at     timestamptz not null default now()
);
create index if not exists wallet_tx_buyer_idx on wallet_transactions(buyer_id);

-- 3) RLS: พาร์ทเนอร์เห็นของตัวเอง · แอดมินเห็นหมด · เขียนผ่าน function เท่านั้น
alter table wallet_transactions enable row level security;
drop policy if exists "wallet read" on wallet_transactions;
create policy "wallet read" on wallet_transactions
  for select using (auth.uid() = buyer_id or is_admin());

-- 4) settle_bill เวอร์ชันใหม่: ผู้ขายได้เต็ม + หักค่าคอม 2% จากเครดิต + gate ≥ 300
create or replace function settle_bill(
  p_source text, p_job_id uuid, p_seller_name text, p_seller_phone text,
  p_items jsonb, p_payment text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_buyer uuid := auth.uid();
  v_goods numeric; v_fee numeric; v_net numeric; v_bill uuid;
  v_seller uuid; v_month text := to_char(now(),'YYYY-MM');
  v_grant int; v_used int; i int;
  v_credit numeric;
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;
  -- ต้องเป็นผู้ซื้อ active + มีเครดิต ≥ 300 (ล็อกแถวกันแข่งกันหัก)
  select credit into v_credit from profiles
    where id=v_buyer and role='buyer' and status='active' for update;
  if v_credit is null then raise exception 'not an active buyer'; end if;
  if v_credit < 300 then raise exception 'insufficient credit (min 300)'; end if;

  select coalesce(sum((it->>'qty')::numeric * (it->>'price_per_unit')::numeric),0)
    into v_goods from jsonb_array_elements(p_items) it;
  v_fee := round(v_goods * 0.02);              -- ค่าคอมบริษัท 2% (หักจากเครดิต)
  v_net := v_goods;                            -- ผู้ขายได้เต็มจำนวน

  -- หักค่าคอมจากเครดิตพาร์ทเนอร์ + บันทึกธุรกรรม
  update profiles set credit = credit - v_fee where id = v_buyer
    returning credit into v_credit;
  insert into wallet_transactions(buyer_id, type, amount, balance_after, note, job_id)
    values (v_buyer, 'commission', -v_fee, v_credit, 'ค่าคอมบิล', p_job_id);

  insert into bills(code, buyer_id, source, job_id, seller_name, seller_phone,
                    goods_total, fee, net_paid, payment_method, status)
  values ('B-'||lpad((floor(random()*9000)+1000)::int::text,4,'0'), v_buyer, p_source, p_job_id,
          p_seller_name, p_seller_phone, v_goods, v_fee, v_net, coalesce(p_payment,'cash'), 'paid')
  returning id into v_bill;

  insert into bill_items(bill_id, material_id, name, unit, qty, price_per_unit, subtotal)
  select v_bill, it->>'material_id', it->>'name', it->>'unit',
         (it->>'qty')::numeric, (it->>'price_per_unit')::numeric,
         (it->>'qty')::numeric * (it->>'price_per_unit')::numeric
  from jsonb_array_elements(p_items) it;

  if p_source = 'app_job' and p_job_id is not null then
    update jobs set status='completed', final_amount=v_goods
      where id=p_job_id and buyer_id=v_buyer and status in ('confirmed','en_route')
      returning seller_id into v_seller;
    if v_seller is not null then
      insert into job_status_history(job_id,status,note)
        values (p_job_id,'completed','ออกบิล '||v_goods||' บาท');
      v_grant := least(50, floor(v_goods/100));                  -- เพดาน/บิล
      select count(*) into v_used from reward_tickets where user_id=v_seller and month=v_month;
      v_grant := greatest(0, least(v_grant, 300 - v_used));      -- เพดาน/เดือน
      for i in 1..v_grant loop
        insert into reward_tickets(number,user_id,month,from_job_id)
        values (lpad((floor(random()*900000)+100000)::int::text,6,'0'), v_seller, v_month, p_job_id);
      end loop;
    end if;
  end if;
  return v_bill;
end $$;

-- 5) แอดมินปรับเครดิตพาร์ทเนอร์ (บวก/ลบ) + บันทึกธุรกรรม
create or replace function adjust_credit(p_user uuid, p_amount numeric, p_note text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_bal numeric;
begin
  if not is_admin() then raise exception 'admin only'; end if;
  update profiles set credit = credit + p_amount where id = p_user returning credit into v_bal;
  if v_bal is null then raise exception 'user not found'; end if;
  insert into wallet_transactions(buyer_id, type, amount, balance_after, note)
    values (p_user, 'adjust', p_amount, v_bal, coalesce(p_note,'ปรับโดยแอดมิน'));
  return v_bal;
end $$;

-- 6) เติมเครดิต (production: เรียกจาก webhook ยืนยันการโอนเท่านั้น)
create or replace function topup_credit(p_user uuid, p_amount numeric, p_note text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v_bal numeric;
begin
  if not is_admin() then raise exception 'admin/service only'; end if;   -- ยืนยันการโอนฝั่ง server
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  update profiles set credit = credit + p_amount where id = p_user returning credit into v_bal;
  if v_bal is null then raise exception 'user not found'; end if;
  insert into wallet_transactions(buyer_id, type, amount, balance_after, note)
    values (p_user, 'topup', p_amount, v_bal, coalesce(p_note,'เติมเครดิต'));
  return v_bal;
end $$;

commit;
