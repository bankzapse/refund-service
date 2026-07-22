-- ล็อกอินด้วยชื่อผู้ใช้ สำหรับพอร์ทัลหลังบ้าน (บริษัท / แฟรนไชส์ / ศูนย์คัดแยก)
--
-- เดิมทุกพอร์ทัลใช้เบอร์+รหัสผ่าน ทำให้บัญชีหลังบ้านต้องผูกกับเบอร์จริง
-- ซึ่งไม่จำเป็น (พนักงานไม่ควรต้องใช้เบอร์ส่วนตัว) และทำให้เบอร์นั้นเอาไป
-- สมัครเป็นผู้ขายไม่ได้
--
-- วิธี: Supabase auth รองรับ email+password → ให้บัญชีหลังบ้านมีอีเมลภายใน
-- <username>@thungkheow.local (โดเมนสงวน ไม่มีจริง ส่งเมลไม่ได้ ใช้เป็น key ล้วน)
-- ฝั่งเว็บแปลง username → อีเมลนี้ก่อนเรียก signInWithPassword
-- จึงไม่ต้องมี endpoint ค้นหา username (ซึ่งจะเปิดช่องให้ไล่เดาว่ามีใครในระบบบ้าง)

alter table profiles add column if not exists username text;

comment on column profiles.username is
  'ชื่อผู้ใช้สำหรับพอร์ทัลหลังบ้าน — auth ใช้ <username>@thungkheow.local เป็นอีเมล';

-- ไม่ให้ชื่อซ้ำโดยไม่สนตัวพิมพ์ (Owner กับ owner ต้องเป็นคนเดียวกัน)
create unique index if not exists profiles_username_key
  on profiles (lower(username))
  where username is not null;

-- ตรึงไม่ให้ client แก้เอง — เปลี่ยน username = เปลี่ยนกุญแจเข้าระบบ
-- ⚠️ SECURITY INVOKER (ห้ามใส่ security definer — ดูเหตุผลใน round 5)
create or replace function profiles_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.role        := old.role;
    new.roles       := old.roles;
    new.owner       := old.owner;
    new.permissions := old.permissions;
    new.credit      := old.credit;
    new.points      := old.points;
    new.status      := old.status;
    new.payout      := old.payout;
    new.partner     := old.partner;
    new.franchise_id := old.franchise_id;
    new.line_user_id := old.line_user_id;
    new.line_connected := old.line_connected;
    new.consent_at      := old.consent_at;
    new.consent_version := old.consent_version;
    new.consent_source  := old.consent_source;
    new.username        := old.username;   -- ใหม่
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_trg on profiles;
create trigger profiles_guard_trg
  before update on profiles
  for each row execute function profiles_guard();
