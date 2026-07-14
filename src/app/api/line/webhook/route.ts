import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/line";

export const runtime = "nodejs";

// LINE เรียก verify ตอนตั้งค่า webhook
export async function GET() {
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/line/webhook — รับ event จาก LINE OA
 * production: ผูก lineUserId เข้ากับผู้ใช้ในระบบเมื่อมีคน add friend / ส่งข้อความ
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const body = JSON.parse(raw || "{}");
  for (const _ev of body.events ?? []) {
    // TODO(production): ev.type === "follow" → บันทึกว่าเป็นเพื่อน OA
    //                   ev.type === "message" & account-link → ผูก userId เข้ากับ profile
    void _ev; // ไม่ log userId (PII) ลง serverless logs
  }
  return NextResponse.json({ ok: true });
}
