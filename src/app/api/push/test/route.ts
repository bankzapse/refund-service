import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendToUser, pushConfigured } from "@/lib/push";

export const runtime = "nodejs";

/** ส่ง push ทดสอบหาตัวเอง (ผู้ใช้ที่ล็อกอิน) — ไว้ยืนยันว่าตั้งค่า FCM สำเร็จ */
export async function POST() {
  if (!pushConfigured) return NextResponse.json({ ok: false, error: "FCM not configured" }, { status: 404 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const res = await sendToUser(user.id, "ถุงเขียว", "ทดสอบการแจ้งเตือน 🎉 ระบบ push ทำงานแล้ว");
  return NextResponse.json(res, { status: res.ok ? 200 : 502 });
}
