import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOtp } from "@/lib/otp";
import { smsokConfigured, normalizeThaiPhone } from "@/lib/smsok";

export const runtime = "nodejs";

const toE164 = (p: string) => "+66" + normalizeThaiPhone(p).replace(/^0/, "");
const bad = (msg: string, status = 400) => NextResponse.json({ ok: false, error: msg }, { status });

/**
 * สมัครสมาชิก (ผู้ขาย) ในโหมด Supabase — ยืนยันเบอร์ด้วย OTP ของ SMS OK (ไม่ใช้ OTP ในตัว Supabase)
 * ตรวจ OTP → สร้าง auth user (service_role, phone_confirm) → trigger สร้าง profile role=seller
 * client จะ signInWithPassword ต่อเองเพื่อรับ session
 */
export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return bad("not enabled", 404);

  const { name, phone, password, code, token } = await req.json().catch(() => ({}));
  const p = normalizeThaiPhone(String(phone || ""));
  if (!String(name || "").trim()) return bad("กรอกชื่อ");
  if (!/^0\d{8,9}$/.test(p)) return bad("เบอร์โทรไม่ถูกต้อง");
  if (String(password || "").length < 6) return bad("รหัสผ่านอย่างน้อย 6 ตัวอักษร");

  // ยืนยัน OTP (เฉพาะเมื่อเปิด SMS OK — ไม่งั้นข้ามเหมือนโหมดทดลอง)
  if (smsokConfigured) {
    const v = verifyOtp(p, String(code || "").trim(), String(token || ""));
    if (!v.ok) return bad("รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    phone: toE164(p),
    password,
    phone_confirm: true,
    user_metadata: { name: String(name).trim(), role: "seller" },
  });
  if (error) {
    const dup = /already|exists|registered/i.test(error.message);
    return bad(dup ? "เบอร์นี้มีบัญชีอยู่แล้ว" : error.message);
  }
  return NextResponse.json({ ok: true });
}
