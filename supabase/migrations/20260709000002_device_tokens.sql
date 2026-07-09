-- โทเคนอุปกรณ์สำหรับ Push Notification (FCM/APNs) — ผูกกับผู้ใช้
-- idempotent

create table if not exists device_tokens (
  token      text primary key,
  user_id    uuid references profiles(id) on delete cascade,
  platform   text,                          -- ios | android
  updated_at timestamptz not null default now()
);

alter table device_tokens enable row level security;

-- ผู้ใช้จัดการโทเคนของตัวเองได้ (service_role ฝั่ง server ส่ง push โดย bypass RLS)
drop policy if exists device_tokens_own on device_tokens;
create policy device_tokens_own on device_tokens for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
