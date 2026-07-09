-- ที่อยู่/พื้นที่ + สิทธิ์ผู้ดูแล (ตามฟีเจอร์ใหม่ฝั่งบริษัท/ศูนย์คัดแยก)
-- idempotent — รันซ้ำได้

-- ศูนย์คัดแยก (profiles role=buyer): ที่อยู่ + พื้นที่
alter table profiles add column if not exists address     text;
alter table profiles add column if not exists province    text;
alter table profiles add column if not exists district    text;
alter table profiles add column if not exists subdistrict text;

-- ผู้ดูแลบริษัท: owner + สิทธิ์เมนู + แฟรนไชส์ที่ผูก
alter table profiles add column if not exists owner        boolean not null default false;
alter table profiles add column if not exists permissions  text[]  not null default '{}';
alter table profiles add column if not exists franchise_id uuid;

-- ตู้: พื้นที่ (จังหวัด/อำเภอ/ตำบล)
alter table cabinets add column if not exists province    text;
alter table cabinets add column if not exists district    text;
alter table cabinets add column if not exists subdistrict text;
