import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** ปลายทางยืนยันอีเมล / OAuth — แลก code เป็น session แล้วเข้าแอป */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}/home`);
}
