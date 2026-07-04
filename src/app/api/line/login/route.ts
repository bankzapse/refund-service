import { NextResponse } from "next/server";
import { buildLoginUrl } from "@/lib/line";

/**
 * GET /api/line/login?state=<appUserId>
 * เริ่ม LINE Login OAuth — redirect ผู้ใช้ไปหน้า LINE เพื่ออนุญาต
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state") ?? "app";
  const loginUrl = buildLoginUrl(state);
  if (!loginUrl) {
    return NextResponse.redirect(new URL("/income?line=not_configured", req.url));
  }
  return NextResponse.redirect(loginUrl);
}
