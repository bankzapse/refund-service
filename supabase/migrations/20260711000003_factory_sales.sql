-- ขายวัสดุคัดแยกให้โรงงานของเก่า → ส่วนต่าง (ราคาขายโรงงาน − ราคาที่จ่ายผู้ขาย) = กำไรบริษัท (ชั้นที่ 3)
-- idempotent

-- 1) ราคาขายโรงงาน/กก. ต่อวัสดุ (บริษัทตั้ง) — เก็บบน material_prices
alter table material_prices add column if not exists factory_price_per_unit numeric not null default 0;

-- 2) บันทึกการขายให้โรงงาน
create table if not exists factory_sales (
  id           uuid primary key default gen_random_uuid(),
  sold_by      uuid references profiles(id) on delete set null,
  factory_name text,
  note         text,
  items        jsonb not null default '[]'::jsonb, -- [{materialId,name,qtyKg,factoryPrice,sellerPrice,revenue,cost,profit}]
  revenue      numeric not null default 0,
  cost         numeric not null default 0,
  profit       numeric not null default 0,
  sold_at      timestamptz not null default now()
);
alter table factory_sales enable row level security;
drop policy if exists fs_ops on factory_sales;
create policy fs_ops on factory_sales for all using (is_operator()) with check (is_operator());

-- 3) ศูนย์คัดแยก/บริษัท บันทึกการขาย (คำนวณ revenue/cost/profit ฝั่ง server)
create or replace function record_factory_sale(p_items jsonb, p_factory_name text, p_note text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_rev numeric; v_cost numeric;
begin
  if not is_operator() then raise exception 'operator only'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'no items'; end if;
  select
    coalesce(sum((it->>'qtyKg')::numeric * (it->>'factoryPrice')::numeric), 0),
    coalesce(sum((it->>'qtyKg')::numeric * (it->>'sellerPrice')::numeric), 0)
    into v_rev, v_cost
  from jsonb_array_elements(p_items) it;
  insert into factory_sales(sold_by, factory_name, note, items, revenue, cost, profit)
    values (auth.uid(), nullif(btrim(p_factory_name), ''), nullif(btrim(p_note), ''), p_items, v_rev, v_cost, v_rev - v_cost)
    returning id into v_id;
  return v_id;
end $$;

-- 4) บริษัทตั้งราคาขายโรงงาน/กก.
create or replace function set_factory_price(p_material_id text, p_price numeric)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'admin only'; end if;
  update material_prices set factory_price_per_unit = greatest(0, coalesce(p_price, 0)) where id = p_material_id;
end $$;
