-- แฟรนไชส์อ่านถุง/รายการในตู้ของตัวเองได้ (แดชบอร์ด "ถุงรอคัดแยก")
-- เดิม RLS "bags read" ให้เฉพาะเจ้าของถุง (ผู้ขาย) หรือ operator (buyer/admin)
-- เจ้าของแฟรนไชส์ (role=franchise) จึงอ่านถุงในตู้ตัวเองไม่ได้ → นับได้ 0 เสมอ

create or replace function owns_cabinet(p_cabinet uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from cabinets c
    join profiles p on p.id = auth.uid()
    where c.id = p_cabinet
      and p.role = 'franchise'
      and c.franchise_id = p.franchise_id
  );
$$;

drop policy if exists "bags read" on mesh_bags;
create policy "bags read" on mesh_bags for select using (
  auth.uid() = user_id or is_operator() or owns_cabinet(cabinet_id)
);

drop policy if exists "bagitems read" on bag_items;
create policy "bagitems read" on bag_items for select using (
  exists (
    select 1 from mesh_bags b
    where b.id = bag_id
      and (b.user_id = auth.uid() or is_operator() or owns_cabinet(b.cabinet_id))
  )
);
