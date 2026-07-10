-- ปิดช่องโหว่: profiles ถูกอ่านได้แบบสาธารณะ (anon) → จำกัดให้อ่านได้เฉพาะผู้ที่ล็อกอินแล้ว
-- แอปโหลด profiles.select("*") หลังล็อกอินเสมอ (คอนโซลบริษัทต้องเห็นผู้ใช้ทั้งหมด) → นโยบายนี้ไม่ทำให้แอปพัง
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
  for select using (auth.uid() is not null);
