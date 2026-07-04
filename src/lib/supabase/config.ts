/** true เมื่อใส่ env ครบ → แอปจะใช้ Supabase Auth จริง (ไม่มี = โหมดเดโม localStorage) */
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
