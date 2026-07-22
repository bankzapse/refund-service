/**
 * ชื่อผู้ใช้สำหรับพอร์ทัลหลังบ้าน (บริษัท / แฟรนไชส์ / ศูนย์คัดแยก)
 *
 * Supabase auth ไม่มี username ในตัว → ผูกกับอีเมลภายในโดเมนสงวนแทน
 * "Owner" → owner@thungkheow.local  (ไม่สนตัวพิมพ์เล็กใหญ่)
 *
 * โดเมนนี้ไม่มีอยู่จริง ส่งอีเมลไม่ได้ ใช้เป็น key ล้วน ๆ
 * (รูปแบบเดียวกับที่ระบบใช้กับบัญชี LINE: line_<id>@line.local)
 */
export const INTERNAL_EMAIL_DOMAIN = "thungkheow.local";

/** a-z 0-9 . _ - ยาว 3–32 — กันอักขระที่ทำให้อีเมลเพี้ยน */
const RE = /^[a-z0-9._-]{3,32}$/;

export const normalizeUsername = (u: string) => String(u ?? "").trim().toLowerCase();

export function isValidUsername(u: string): boolean {
  return RE.test(normalizeUsername(u));
}

/** คืนอีเมลภายในของ username — null ถ้ารูปแบบไม่ผ่าน */
export function usernameToEmail(u: string): string | null {
  const n = normalizeUsername(u);
  return RE.test(n) ? `${n}@${INTERNAL_EMAIL_DOMAIN}` : null;
}

/**
 * ผู้ใช้กรอกอะไรมา — เบอร์โทร หรือ ชื่อผู้ใช้
 * ตัวเลขล้วน 9–10 หลักขึ้นต้น 0 = เบอร์ · นอกนั้นถือเป็นชื่อผู้ใช้
 *
 * รับทั้งสองแบบเพื่อไม่ให้บัญชีเดิมที่ยังไม่มี username ล็อกเอาต์
 */
export function looksLikePhone(input: string): boolean {
  const d = String(input ?? "").replace(/\D/g, "");
  return /^0\d{8,9}$/.test(d);
}
