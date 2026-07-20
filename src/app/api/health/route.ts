import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Health / config check — บอกว่า env/config ครบไหม (คืนค่าเป็น boolean เท่านั้น ไม่เปิดเผย secret)
 * ใช้เช็คบน production ว่าทำไมส่ง OTP/สมัครไม่ได้ เช่น GET /api/health
 * ผู้ขายรับ OTP ได้เมื่อ smsok=true + otpReady=true (register/forgot ใช้ OTP ของแอปเอง — ดู lib/otp.ts)
 */
export async function GET() {
  const has = (v?: string) => Boolean(v && v.trim());
  const supabase = has(process.env.NEXT_PUBLIC_SUPABASE_URL) && has(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const serviceRole = has(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const smsok = has(process.env.SMSOK_API_KEY) && has(process.env.SMSOK_API_SECRET);
  const otpSecret = has(process.env.OTP_SECRET); // ตั้งไว้ตรง ๆ หรือยัง
  // lib/otp.ts fallback ไปใช้ SMSOK_API_SECRET ถ้าไม่ได้ตั้ง OTP_SECRET — เซ็นโทเคนได้เหมือนกัน
  const otpReady = otpSecret || has(process.env.SMSOK_API_SECRET);

  const mode = supabase ? "supabase" : "demo";
  // ผู้ขายจะสมัคร/รับ OTP ได้ก็ต่อเมื่อ: โหมดเดโม (ข้าม OTP ได้) หรือ SMS OK ครบ + เซ็นโทเคน OTP ได้
  const canSellerOtp = mode === "demo" ? true : smsok && otpReady;

  return NextResponse.json({
    ok: true,
    mode,
    rev: (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7), // commit ที่ deploy อยู่
    canSellerOtp,
    smsSender: process.env.SMSOK_SENDER || "Chao-Dee", // ชื่อผู้ส่ง SMS ที่ใช้จริง (ไม่ใช่ secret)
    config: { supabase, serviceRole, smsok, otpSecret, otpReady },
    hint: !canSellerOtp
      ? "ผู้ขายจะรับ OTP ไม่ได้ — ตั้ง SMSOK_API_KEY/SMSOK_API_SECRET (Sender อนุมัติ + มียอดเงิน) และ OTP_SECRET"
      : otpSecret
        ? "พร้อมส่ง OTP ให้ผู้ขาย"
        : "พร้อมส่ง OTP ให้ผู้ขาย — แต่ควรตั้ง OTP_SECRET แยก (ตอนนี้ยืมลายเซ็นจาก SMSOK_API_SECRET)",
  });
}
