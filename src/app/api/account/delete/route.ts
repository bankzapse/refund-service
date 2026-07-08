import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * ลบบัญชีตัวเอง (in-app account deletion) — บังคับโดย App Store / Play
 * ตรวจ session ของผู้เรียก → ลบ auth user ด้วย service_role
 * → cascade ลบ profiles → mesh_bags / point_transactions / redemptions / ฯลฯ ทั้งหมด
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  await supabase.auth.signOut().catch(() => {});
  return NextResponse.json({ ok: true });
}
