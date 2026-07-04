import type { Material } from "./types";

/**
 * แคตตาล็อกวัสดุรีไซเคิล + ราคากลางโดยประมาณ (บาท)
 * ราคาอ้างอิงตลาดของเก่าไทย — แอดมินปรับได้จริงใน production
 */
export const MATERIALS: Material[] = [
  // กระดาษ
  { id: "cardboard", name: "ลังกระดาษ", unit: "กก.", pricePerUnit: 4, emoji: "📦", category: "กระดาษ" },
  { id: "paper-white", name: "กระดาษขาว-ดำ", unit: "กก.", pricePerUnit: 7, emoji: "📄", category: "กระดาษ" },
  { id: "newspaper", name: "หนังสือพิมพ์", unit: "กก.", pricePerUnit: 5, emoji: "📰", category: "กระดาษ" },
  // แก้ว
  { id: "glass-bottle", name: "ขวดแก้วรวม", unit: "กก.", pricePerUnit: 1, emoji: "🍶", category: "แก้ว" },
  { id: "beer-crate", name: "ลังเบียร์", unit: "ใบ", pricePerUnit: 45, emoji: "🍺", category: "แก้ว" },
  // โลหะ
  { id: "steel", name: "เหล็กรวม", unit: "กก.", pricePerUnit: 8, emoji: "⚙️", category: "โลหะ" },
  { id: "aluminum-can", name: "กระป๋องอลูมิเนียม", unit: "กก.", pricePerUnit: 42, emoji: "🥫", category: "โลหะ" },
  { id: "copper", name: "ทองแดง", unit: "กก.", pricePerUnit: 230, emoji: "🟤", category: "โลหะ" },
  { id: "brass", name: "ทองเหลือง", unit: "กก.", pricePerUnit: 110, emoji: "🟡", category: "โลหะ" },
  // พลาสติก
  { id: "pet", name: "ขวดพลาสติกใส (PET)", unit: "กก.", pricePerUnit: 10, emoji: "🧴", category: "พลาสติก" },
  { id: "plastic-mixed", name: "พลาสติกรวม", unit: "กก.", pricePerUnit: 4, emoji: "♻️", category: "พลาสติก" },
];

export const MATERIAL_MAP: Record<string, Material> = Object.fromEntries(
  MATERIALS.map((m) => [m.id, m]),
);

export const CATEGORIES = ["กระดาษ", "แก้ว", "โลหะ", "พลาสติก"] as const;
