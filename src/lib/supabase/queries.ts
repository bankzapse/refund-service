/**
 * Data-access seam (ฝั่ง client) สำหรับ production
 * แทนที่ logic ใน store.tsx ทีละส่วนเมื่อพร้อมย้ายไป Supabase
 * งานที่ต้องปลอดภัย (ออกบิล/สิทธิ์/รางวัล/ระงับ) เรียกผ่าน RPC function เท่านั้น
 */
import { createClient } from "./client";

export interface SettleBillInput {
  source: "app_job" | "walk_in";
  jobId?: string | null;
  sellerName: string;
  sellerPhone: string;
  items: { material_id: string; name: string; unit: string; qty: number; price_per_unit: number }[];
  paymentMethod: "cash" | "transfer";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sb(): any {
  return createClient();
}

export async function fetchProfile(id: string) {
  const { data } = await sb().from("profiles").select("*").eq("id", id).single();
  return data;
}

export async function fetchCentralPrices() {
  const { data } = await sb().from("material_prices").select("*").order("category");
  return data ?? [];
}

export async function fetchMyBills(buyerId: string) {
  const { data } = await sb().from("bills").select("*").eq("buyer_id", buyerId).order("created_at", { ascending: false });
  return data ?? [];
}

/** 🔒 ออกบิล + ปิดงาน + mint สิทธิ์ (server-side, กัน fraud) */
export async function settleBill(input: SettleBillInput) {
  const { data, error } = await sb().rpc("settle_bill", {
    p_source: input.source,
    p_job_id: input.jobId ?? null,
    p_seller_name: input.sellerName,
    p_seller_phone: input.sellerPhone,
    p_items: input.items,
    p_payment: input.paymentMethod,
  });
  return { billId: (data as string) ?? null, error: error?.message ?? null };
}

/** 🔒 สุ่มผู้โชคดี (แอดมิน) */
export async function drawWinner(month: string) {
  const { error } = await sb().rpc("draw_reward_winner", { p_month: month });
  return { error: error?.message ?? null };
}

/** 🔒 ระงับ/เปิดบัญชี (แอดมิน) */
export async function setUserStatus(userId: string, status: "active" | "suspended") {
  const { error } = await sb().rpc("set_user_status", { p_user: userId, p_status: status });
  return { error: error?.message ?? null };
}
