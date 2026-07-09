-- ระบบโอนส่วนแบ่งแฟรนไชส์ (บัญชีรับเงิน + อนุมัติ + โอน) — ให้ทำงานบน Supabase
-- idempotent

-- 1) บัญชีรับเงินของเจ้าของแฟรนไชส์ (เก็บบน profiles)
alter table profiles add column if not exists payout jsonb;

-- 2) ประวัติการโอนส่วนแบ่ง
create table if not exists franchise_payouts (
  id            uuid primary key default gen_random_uuid(),
  franchise_id  uuid references franchises(id) on delete set null,
  franchise_name text,
  amount        numeric not null,
  note          text,
  paid_at       timestamptz not null default now()
);
alter table franchise_payouts enable row level security;
drop policy if exists fp_admin on franchise_payouts;
create policy fp_admin on franchise_payouts for all using (is_admin()) with check (is_admin());
drop policy if exists fp_read on franchise_payouts;
create policy fp_read on franchise_payouts for select using (
  is_admin() or exists (
    select 1 from profiles where id = auth.uid() and role = 'franchise' and franchise_id = franchise_payouts.franchise_id
  )
);

-- 3) แฟรนไชส์ส่งบัญชีรับเงิน (ของตัวเอง)
create or replace function submit_payout(p_payout jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update profiles
    set payout = coalesce(p_payout, '{}'::jsonb) || jsonb_build_object('status', 'pending', 'submittedAt', now())
    where id = auth.uid();
end $$;

-- 4) บริษัทอนุมัติ/ปฏิเสธบัญชี
create or replace function review_payout(p_user uuid, p_approve boolean, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'admin only'; end if;
  update profiles
    set payout = coalesce(payout, '{}'::jsonb) || jsonb_build_object(
      'status', case when p_approve then 'approved' else 'rejected' end,
      'note',   case when p_approve then null else coalesce(nullif(btrim(p_note), ''), 'ข้อมูลไม่ถูกต้อง') end,
      'reviewedAt', now())
    where id = p_user and payout is not null;
end $$;

-- 5) บริษัทโอนส่วนแบ่งให้แฟรนไชส์ (ต้องบัญชี approved ก่อน)
create or replace function pay_franchise(p_franchise_id uuid, p_amount numeric, p_note text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_name text; v_status text;
begin
  if not is_admin() then raise exception 'admin only'; end if;
  if not (p_amount > 0) then raise exception 'amount must be > 0'; end if;
  select name into v_name from franchises where id = p_franchise_id;
  if v_name is null then raise exception 'franchise not found'; end if;
  select payout->>'status' into v_status from profiles where role = 'franchise' and franchise_id = p_franchise_id limit 1;
  if v_status is distinct from 'approved' then raise exception 'franchise payout not approved'; end if;
  insert into franchise_payouts(franchise_id, franchise_name, amount, note)
    values (p_franchise_id, v_name, p_amount, nullif(btrim(p_note), '')) returning id into v_id;
  return v_id;
end $$;
