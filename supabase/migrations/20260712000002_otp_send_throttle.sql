-- B3: กันสแปม OTP แบบ shared (แทน in-memory ที่ bypass บน serverless ได้)
-- เพิ่มคอลัมน์คุมความถี่/โควตาการส่งต่อเบอร์ในตาราง otp_throttle เดิม
alter table otp_throttle add column if not exists last_send   timestamptz;
alter table otp_throttle add column if not exists sends_day    date;
alter table otp_throttle add column if not exists sends_count  int not null default 0;
