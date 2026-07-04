import { NextResponse } from "next/server";
import { pushText, statusMessage, lineConfigured } from "@/lib/line";

export const runtime = "nodejs";

/**
 * POST /api/line/notify
 * body: { to: lineUserId, message?: string, code?: string, status?: JobStatus, buyerName?: string }
 * เรียกตอนสถานะงานเปลี่ยน เพื่อ push แจ้งเตือนผู้ขายผ่าน LINE OA
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { to, message, code, status, buyerName } = body ?? {};
  if (!to) return NextResponse.json({ error: "missing 'to' (LINE userId)" }, { status: 400 });

  const text = message ?? (code && status ? statusMessage(code, status, buyerName) : null);
  if (!text) return NextResponse.json({ error: "missing message or (code+status)" }, { status: 400 });

  const result = await pushText(to, text);
  return NextResponse.json({ configured: lineConfigured, result });
}
