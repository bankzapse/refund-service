-- Round 4: รหัสคำขอแลกเงินไม่ชนกัน (เดิม R-#### สุ่ม 4 หลัก ชนได้) → ใช้ sequence
create sequence if not exists redemption_code_seq;

create or replace function redeem_points(p_amount numeric, p_points numeric, p_method text, p_account text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_bal numeric; v_rid uuid; v_code text; v_amount numeric;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if coalesce(p_account, '') = '' then raise exception 'account required'; end if;
  if p_points is null or p_points <= 0 then raise exception 'invalid points'; end if;
  v_amount := p_points; -- 🔒 1 คะแนน = ฿1 เสมอ
  select points into v_bal from profiles where id = v_uid for update;
  if v_bal < p_points then raise exception 'not enough points'; end if;
  update profiles set points = points - p_points where id = v_uid returning points into v_bal;
  v_code := 'R' || lpad(nextval('redemption_code_seq')::text, 6, '0'); -- 🔒 unique
  insert into redemptions(code, user_id, amount_baht, points, method, account, status)
    values (v_code, v_uid, v_amount, p_points, coalesce(p_method, 'promptpay'), p_account, 'pending') returning id into v_rid;
  insert into point_transactions(user_id, type, points, balance_after, note, redemption_id)
    values (v_uid, 'redeem', -p_points, v_bal, 'แลกเงิน ฿' || v_amount, v_rid);
  return v_rid;
end $$;
