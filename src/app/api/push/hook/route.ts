import { NextResponse } from "next/server";
import { sendToUser, pushConfigured } from "@/lib/push";
import { formatBaht } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * ปลายทางสำหรับ Supabase Database Webhook — ส่ง push อัตโนมัติเมื่อมีเหตุการณ์
 * ตั้งใน Supabase: Database → Webhooks → Create
 *   • point_transactions [INSERT] → แจ้ง "ได้รับคะแนน"
 *   • redemptions [UPDATE]        → แจ้ง "โอนเงินแล้ว" (เมื่อ status → paid)
 * เพิ่ม HTTP header: x-webhook-secret = <PUSH_HOOK_SECRET>
 */
export async function POST(req: Request) {
  const secret = process.env.PUSH_HOOK_SECRET;
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!pushConfigured) return NextResponse.json({ ok: true, skipped: "push not configured" });

  const body = await req.json().catch(() => ({}));
  const table = body?.table as string;
  const type = body?.type as string; // INSERT | UPDATE | DELETE
  const rec = body?.record ?? {};
  const old = body?.old_record ?? {};

  try {
    if (table === "point_transactions" && type === "INSERT" && rec.type === "earn" && rec.user_id) {
      await sendToUser(rec.user_id, "ถุงเขียว 🎉", `คุณได้รับ ${formatBaht(Number(rec.points))} คะแนนจากการรีไซเคิล`);
    } else if (table === "redemptions" && type === "UPDATE" && rec.status === "paid" && old.status !== "paid" && rec.user_id) {
      await sendToUser(rec.user_id, "ถุงเขียว 💸", `โอนเงินแลกแต้ม ฿${formatBaht(Number(rec.amount_baht))} ให้คุณแล้ว`);
    }
  } catch {
    /* อย่าให้ webhook พังเพราะ push ล้ม */
  }
  return NextResponse.json({ ok: true });
}
