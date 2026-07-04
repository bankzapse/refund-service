-- ============================================================
-- Recycle Fund — Supabase schema (Phase 1: Production backend)
-- รันใน Supabase SQL Editor ครั้งเดียว (idempotent เท่าที่ทำได้)
-- ครอบคลุม: ผู้ขาย · ผู้ซื้อ/คนขับ · ร้านรับซื้อ · แอดมิน
-- ความปลอดภัย: ออกบิล/สิทธิ์/สุ่มรางวัล ทำใน function (SECURITY DEFINER) เท่านั้น
-- ============================================================

-- ---------- enums ----------
do $$ begin
  create type user_role as enum ('seller','buyer','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('submitted','confirmed','en_route','completed','cancelled');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           user_role not null default 'seller',
  name           text not null,
  phone          text,
  email          text,
  line_user_id   text,
  line_connected boolean not null default false,
  base_lat       double precision,
  base_lng       double precision,
  status         text not null default 'active',   -- active | suspended
  credit         numeric not null default 0,        -- เครดิตพาร์ทเนอร์ (ต้อง ≥ 300 ถึงรับงาน)
  partner        boolean not null default false,    -- เป็นพาร์ทเนอร์โรงงาน (ได้อัตราเลท)
  created_at     timestamptz not null default now()
);

-- ---------- wallet_transactions (ธุรกรรมเครดิตพาร์ทเนอร์) ----------
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

-- ---------- ราคากลาง (แอดมินแก้) ----------
create table if not exists material_prices (
  id             text primary key,
  name           text not null,
  unit           text not null,
  price_per_unit numeric not null,
  emoji          text,
  category       text,
  updated_at     timestamptz not null default now()
);

-- ---------- ราคารับซื้อรายคนขับ (override) ----------
create table if not exists buyer_prices (
  buyer_id    uuid not null references profiles(id) on delete cascade,
  material_id text not null,
  price       numeric not null,
  primary key (buyer_id, material_id)
);

-- ---------- ตารางรอบเข้ารับของผู้ซื้อ ----------
create table if not exists schedule_slots (
  id         uuid primary key default gen_random_uuid(),
  buyer_id   uuid not null references profiles(id) on delete cascade,
  date       date not null,
  area       text,
  capacity   int not null default 8,
  booked     int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- งานรับของ ----------
create table if not exists jobs (
  id              uuid primary key default gen_random_uuid(),
  code            text not null,
  seller_id       uuid not null references profiles(id) on delete cascade,
  buyer_id        uuid references profiles(id) on delete set null,
  slot_id         uuid references schedule_slots(id) on delete set null,
  status          job_status not null default 'submitted',
  lat             double precision,
  lng             double precision,
  address         text,
  house_no        text,
  landmark        text,
  contact_name    text,
  contact_phone   text,
  scheduled_date  date,
  note            text,
  estimated_total numeric not null default 0,
  final_amount    numeric,
  created_at      timestamptz not null default now()
);

create table if not exists job_items (
  id             uuid primary key default gen_random_uuid(),
  job_id         uuid not null references jobs(id) on delete cascade,
  material_id    text not null,
  name           text not null,
  unit           text,
  price_per_unit numeric not null,
  qty            numeric not null
);

create table if not exists job_status_history (
  id     uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  status job_status not null,
  note   text,
  at     timestamptz not null default now()
);

-- ---------- บิลรับซื้อ (ร้าน) ----------
create table if not exists bills (
  id             uuid primary key default gen_random_uuid(),
  code           text not null,
  buyer_id       uuid not null references profiles(id) on delete cascade,
  source         text not null,                 -- app_job | walk_in
  job_id         uuid references jobs(id) on delete set null,
  seller_name    text,
  seller_phone   text,
  goods_total    numeric not null,
  fee            numeric not null,
  net_paid       numeric not null,
  payment_method text not null default 'cash',  -- cash | transfer
  status         text not null default 'paid',  -- paid | void
  created_at     timestamptz not null default now()
);

create table if not exists bill_items (
  id             uuid primary key default gen_random_uuid(),
  bill_id        uuid not null references bills(id) on delete cascade,
  material_id    text,
  name           text not null,
  unit           text,
  qty            numeric not null,
  price_per_unit numeric not null,
  subtotal       numeric not null
);

-- ---------- รายจ่ายร้าน ----------
create table if not exists expenses (
  id         uuid primary key default gen_random_uuid(),
  buyer_id   uuid not null references profiles(id) on delete cascade,
  category   text not null,
  amount     numeric not null,
  date       timestamptz not null default now(),
  note       text,
  created_at timestamptz not null default now()
);

-- ---------- รางวัล ----------
create table if not exists reward_tickets (
  id          uuid primary key default gen_random_uuid(),
  number      text not null,
  user_id     uuid not null references profiles(id) on delete cascade,
  month       text not null,
  from_job_id uuid references jobs(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists reward_draws (
  month          text primary key,
  prize_name     text not null default 'รางวัลประจำเดือน',
  prize_value    numeric default 0,
  winning_number text,
  winner_name    text,
  status         text not null default 'pending',
  announced_at   timestamptz
);

create index if not exists idx_jobs_seller  on jobs(seller_id);
create index if not exists idx_jobs_buyer   on jobs(buyer_id);
create index if not exists idx_jobs_status  on jobs(status);
create index if not exists idx_bills_buyer  on bills(buyer_id);
create index if not exists idx_tickets_user on reward_tickets(user_id, month);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles           enable row level security;
alter table material_prices    enable row level security;
alter table buyer_prices       enable row level security;
alter table schedule_slots     enable row level security;
alter table jobs               enable row level security;
alter table job_items          enable row level security;
alter table job_status_history enable row level security;
alter table bills              enable row level security;
alter table bill_items         enable row level security;
alter table expenses           enable row level security;
alter table reward_tickets     enable row level security;
alter table reward_draws       enable row level security;
alter table wallet_transactions enable row level security;

-- helper: เป็นแอดมินไหม
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: อ่านสาธารณะ · แก้ของตัวเอง · แอดมินแก้ได้หมด
drop policy if exists "profiles read" on profiles;
create policy "profiles read"   on profiles for select using (true);
create policy "profiles insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles update" on profiles for update using (auth.uid() = id or is_admin());

-- ราคากลาง + draws: อ่านสาธารณะ · เขียนเฉพาะแอดมิน
create policy "prices read"  on material_prices for select using (true);
create policy "prices admin" on material_prices for all using (is_admin()) with check (is_admin());
create policy "draws read"   on reward_draws   for select using (true);

-- buyer_prices: อ่านสาธารณะ · แก้เฉพาะเจ้าของ
create policy "bp read"  on buyer_prices for select using (true);
create policy "bp write" on buyer_prices for all using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- schedule_slots
create policy "slots read"   on schedule_slots for select using (true);
create policy "slots manage" on schedule_slots for all using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- jobs: เห็นถ้าเป็นเจ้าของ/ผู้รับ/งานเปิด/แอดมิน
create policy "jobs read" on jobs for select using (
  auth.uid() = seller_id or auth.uid() = buyer_id
  or (status = 'submitted' and buyer_id is null) or is_admin()
);
create policy "jobs insert" on jobs for insert with check (auth.uid() = seller_id);
create policy "jobs update" on jobs for update using (
  auth.uid() = seller_id or auth.uid() = buyer_id
  or (status = 'submitted' and buyer_id is null)
);

create policy "items read" on job_items for select using (
  exists (select 1 from jobs j where j.id = job_id and (j.seller_id = auth.uid() or j.buyer_id = auth.uid() or is_admin()))
);
create policy "items write" on job_items for all using (
  exists (select 1 from jobs j where j.id = job_id and j.seller_id = auth.uid())
) with check (
  exists (select 1 from jobs j where j.id = job_id and j.seller_id = auth.uid())
);
create policy "history read" on job_status_history for select using (
  exists (select 1 from jobs j where j.id = job_id and (j.seller_id = auth.uid() or j.buyer_id = auth.uid() or is_admin()))
);

-- bills/bill_items/expenses: เจ้าของร้าน (buyer) เห็นของตัวเอง · แอดมินเห็นหมด
create policy "bills read"   on bills      for select using (auth.uid() = buyer_id or is_admin());
create policy "items2 read"  on bill_items for select using (
  exists (select 1 from bills b where b.id = bill_id and (b.buyer_id = auth.uid() or is_admin()))
);
create policy "exp manage"   on expenses   for all using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- reward_tickets: เจ้าของเห็นของตัวเอง · แอดมินเห็นหมด (INSERT ทำผ่าน function เท่านั้น)
create policy "tickets read" on reward_tickets for select using (auth.uid() = user_id or is_admin());

-- wallet_transactions: พาร์ทเนอร์เห็นของตัวเอง · แอดมินเห็นหมด (เขียนผ่าน function เท่านั้น)
create policy "wallet read" on wallet_transactions for select using (auth.uid() = buyer_id or is_admin());

-- NB: ไม่มี policy insert/update บน bills, bill_items, reward_tickets, wallet_transactions สำหรับ client
--     → เขียนได้ผ่าน function SECURITY DEFINER เท่านั้น (settle_bill / adjust_credit / topup_credit)

-- ============================================================
-- Trigger: สร้าง profile อัตโนมัติเมื่อสมัคร
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, email, role, line_user_id, line_connected)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'ผู้ใช้ใหม่'),
    new.phone, new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'seller'),
    new.raw_user_meta_data->>'line_user_id',
    (new.raw_user_meta_data->>'line_user_id') is not null
  ) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 🔒 Secure server-side ops (กัน fraud — client เรียกผ่าน rpc)
-- ============================================================

-- ออกบิล + ปิดงาน + mint สิทธิ์ ให้เป็น atomic + ตรวจสิทธิ์ฝั่ง server
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

-- สุ่มผู้โชคดี (แอดมินเท่านั้น) — production ควรผูก seed หวยรัฐ/commit-reveal
create or replace function draw_reward_winner(p_month text)
returns void language plpgsql security definer set search_path = public as $$
declare v_num text; v_winner text;
begin
  if not is_admin() then raise exception 'admin only'; end if;
  select rt.number, p.name into v_num, v_winner
  from reward_tickets rt join profiles p on p.id = rt.user_id
  where rt.month = p_month order by random() limit 1;
  if v_num is null then raise exception 'no tickets for %', p_month; end if;
  insert into reward_draws(month, winning_number, winner_name, status, announced_at)
  values (p_month, v_num, v_winner, 'announced', now())
  on conflict (month) do update
    set winning_number=excluded.winning_number, winner_name=excluded.winner_name,
        status='announced', announced_at=now();
end $$;

-- แอดมินระงับ/เปิดบัญชี
create or replace function set_user_status(p_user uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'admin only'; end if;
  if p_status not in ('active','suspended') then raise exception 'bad status'; end if;
  update profiles set status = p_status where id = p_user;
end $$;

-- แอดมินปรับเครดิตพาร์ทเนอร์ (บวก/ลบ) + บันทึกธุรกรรม
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

-- พาร์ทเนอร์เติมเครดิต (production: เรียกจาก webhook ยืนยันการโอนเท่านั้น)
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

-- ============================================================
-- Seed: ราคากลางเริ่มต้น
-- ============================================================
insert into material_prices (id,name,unit,price_per_unit,emoji,category) values
  ('cardboard','ลังกระดาษ','กก.',4,'📦','กระดาษ'),
  ('paper-white','กระดาษขาว-ดำ','กก.',7,'📄','กระดาษ'),
  ('newspaper','หนังสือพิมพ์','กก.',5,'📰','กระดาษ'),
  ('glass-bottle','ขวดแก้วรวม','กก.',1,'🍶','แก้ว'),
  ('beer-crate','ลังเบียร์','ใบ',45,'🍺','แก้ว'),
  ('steel','เหล็กรวม','กก.',8,'⚙️','โลหะ'),
  ('aluminum-can','กระป๋องอลูมิเนียม','กก.',42,'🥫','โลหะ'),
  ('copper','ทองแดง','กก.',230,'🟤','โลหะ'),
  ('brass','ทองเหลือง','กก.',110,'🟡','โลหะ'),
  ('pet','ขวดพลาสติกใส (PET)','กก.',10,'🧴','พลาสติก'),
  ('plastic-mixed','พลาสติกรวม','กก.',4,'♻️','พลาสติก')
on conflict (id) do nothing;
