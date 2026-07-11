import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { normalizeThaiPhone } from "@/lib/smsok";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const toE164Bare = (p: string) => "66" + p.replace(/^0/, "");

/**
 * ตั้งรหัสผ่านใหม่หลังยืนยัน OTP (ผ่านระบบ OTP ของแอป — ไม่พึ่ง Send SMS Hook ของ Supabase)
 * body: { phone, password, code, token }
 * - ยืนยัน OTP อีกครั้งฝั่ง server แล้วใช้ service_role อัปเดตรหัสผ่านบัญชีที่ผูกเบอร์นี้
 */
export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: "ระบบยังไม่พร้อม" }, { status: 404 });
  }
  const { phone, password, code, token } = await req.json().catch(() => ({}));
  const p = normalizeThaiPhone(String(phone || ""));
  if (!/^0\d{8,9}$/.test(p)) return NextResponse.json({ ok: false, error: "เบอร์ไม่ถูกต้อง" }, { status: 400 });
  if (String(password || "").length < 6) return NextResponse.json({ ok: false, error: "รหัสผ่านอย่างน้อย 6 ตัวอักษร" }, { status: 400 });

  // ยืนยัน OTP อีกครั้ง (กันข้ามขั้นตอน)
  const v = verifyOtp(p, String(code || "").trim(), String(token || ""));
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error ?? "รหัส OTP ไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = (n: string) => (admin as any).from(n);
  const bare = toE164Bare(p);
  const { data } = await table("profiles").select("id").or(`phone.eq.${bare},phone.eq.${p}`).limit(1);
  const uid = (data as { id: string }[] | null)?.[0]?.id;
  if (!uid) return NextResponse.json({ ok: false, error: "ไม่พบบัญชีสำหรับเบอร์นี้" }, { status: 404 });

  const { error } = await admin.auth.admin.updateUserById(uid, { password: String(password) });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
