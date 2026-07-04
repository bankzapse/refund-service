import { NextResponse } from "next/server";
import { exchangeCodeForProfile } from "@/lib/line";

export const runtime = "nodejs";

/**
 * GET /api/line/callback — LINE เรียกกลับหลังผู้ใช้อนุญาต
 * แลก code → LINE profile (userId, displayName) แล้วผูกกับผู้ใช้ในระบบ
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  // const state = url.searchParams.get("state"); // = appUserId (production)

  if (!code) return NextResponse.redirect(new URL("/income?line=error", req.url));

  const profile = await exchangeCodeForProfile(code);
  if (!profile) return NextResponse.redirect(new URL("/income?line=error", req.url));

  // TODO(production): update profiles set line_user_id = profile.userId where id = state (Supabase)
  return NextResponse.redirect(new URL(`/income?line=connected`, req.url));
}
