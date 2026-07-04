/**
 * LINE OA integration helpers (server-only).
 * ต้องตั้งค่า env จึงจะทำงานจริง (ดู .env.example) — ถ้าไม่มี token จะ no-op อย่างปลอดภัย
 *
 * ใช้ 2 ช่องทางของ LINE:
 *  1) Messaging API (OA)   → push แจ้งเตือนสถานะงานให้ผู้ขาย
 *  2) LINE Login (OAuth)   → เชื่อมบัญชีผู้ใช้กับ LINE userId
 */
import crypto from "crypto";
import type { JobStatus } from "./types";

const MESSAGING_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const MESSAGING_SECRET = process.env.LINE_CHANNEL_SECRET;
const LOGIN_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID;
const LOGIN_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET;
const LOGIN_REDIRECT_URI = process.env.LINE_LOGIN_REDIRECT_URI;

export const lineConfigured = Boolean(MESSAGING_TOKEN);
export const lineLoginConfigured = Boolean(LOGIN_CHANNEL_ID && LOGIN_CHANNEL_SECRET && LOGIN_REDIRECT_URI);

/** ส่งข้อความ (push) ไปยัง LINE userId — คืน {skipped:true} ถ้ายังไม่ตั้งค่า token */
export async function pushText(to: string, text: string) {
  if (!MESSAGING_TOKEN) return { skipped: true as const, reason: "LINE_CHANNEL_ACCESS_TOKEN not set" };
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MESSAGING_TOKEN}`,
    },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });
  return { ok: res.ok, status: res.status };
}

/** ตรวจ signature ของ webhook จาก LINE (ความปลอดภัย) */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!MESSAGING_SECRET || !signature) return false;
  const hash = crypto.createHmac("sha256", MESSAGING_SECRET).update(rawBody).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** ข้อความแจ้งเตือนสถานะงาน (ภาษาไทย) */
export function statusMessage(code: string, status: JobStatus, buyerName?: string): string {
  const map: Record<JobStatus, string> = {
    submitted: `📮 รายการ ${code} ถูกส่งแล้ว กำลังรอผู้ซื้อรับงาน`,
    confirmed: `✅ ผู้ซื้อ${buyerName ? ` (${buyerName})` : ""} คอนเฟิร์มรับงาน ${code} แล้ว`,
    en_route: `🚚 คนขับกำลังเดินทางไปรับของ (${code}) โปรดเตรียมของให้พร้อม`,
    completed: `🎉 งาน ${code} สำเร็จแล้ว! ขอบคุณที่ใช้บริการ Recycle Fund`,
    cancelled: `⚠️ งาน ${code} ถูกยกเลิก`,
  };
  return map[status];
}

/* ---------------- LINE Login (OAuth 2.1) ---------------- */

export function buildLoginUrl(state: string): string | null {
  if (!LOGIN_CHANNEL_ID || !LOGIN_REDIRECT_URI) return null;
  const p = new URLSearchParams({
    response_type: "code",
    client_id: LOGIN_CHANNEL_ID,
    redirect_uri: LOGIN_REDIRECT_URI,
    state,
    scope: "profile openid",
  });
  return `https://access.line.me/oauth2/v2.1/authorize?${p.toString()}`;
}

export async function exchangeCodeForProfile(code: string) {
  if (!LOGIN_CHANNEL_ID || !LOGIN_CHANNEL_SECRET || !LOGIN_REDIRECT_URI) return null;
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: LOGIN_REDIRECT_URI,
      client_id: LOGIN_CHANNEL_ID,
      client_secret: LOGIN_CHANNEL_SECRET,
    }),
  });
  if (!tokenRes.ok) return null;
  const token = (await tokenRes.json()) as { access_token: string };
  const profRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profRes.ok) return null;
  return (await profRes.json()) as { userId: string; displayName: string; pictureUrl?: string };
}
