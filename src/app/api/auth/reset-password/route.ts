import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyOtp } from "@/lib/otp";
import { smsokConfigured, normalizeThaiPhone } from "@/lib/smsok";

export const runtime = "nodejs";

const toE164 = (p: string) => "+66" + normalizeThaiPhone(p).replace(/^0/, "");
const bad = (msg: string, status = 400) => NextResponse.json({ ok: false, error: msg }, { status });

/**
 * ตั้งรหัสผ่านใหม่ (โหมด Supabase) — ยืนยันเบอร์ด้วย OTP ของ SMS OK
 * ตรวจ OTP → หา user จากเบอร์ (profiles.phone = E164) → อัปเดตรหัสด้วย service_role
 */
export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return bad("not enabled", 404);

  const { phone, password, code, token } = await req.json().catch(() => ({}));
  const p = normalizeThaiPhone(String(phone || ""));
  if (!/^0\d{8,9}$/.test(p)) return bad("เบอร์โทรไม่ถูกต้อง");
  if (String(password || "").length < 6) return bad("รหัสผ่านอย่างน้อย 6 ตัวอักษร");

  if (smsokConfigured) {
    const v = verifyOtp(p, String(code || "").trim(), String(token || ""));
    if (!v.ok) return bad("รหัส OTP ไม่ถูกต้องหรือหมดอายุ");
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prof } = await (admin as any).from("profiles").select("id").eq("phone", toE164(p)).maybeSingle();
  if (!prof?.id) return bad("ไม่พบบัญชีสำหรับเบอร์นี้");

  const { error } = await admin.auth.admin.updateUserById(prof.id, { password });
  if (error) return bad(error.message, 500);
  return NextResponse.json({ ok: true });
}
