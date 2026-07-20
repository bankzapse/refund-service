/**
 * โมเดล (เฟสแรก — ไม่ใช้ payment gateway): ระบบเครดิต + ค่าคอมบริษัท
 * - ผู้รับซื้อ (พาร์ทเนอร์) ได้ "อัตราเลทโรงงาน" (= ราคากลาง) แล้วตั้งราคารับซื้อ "ต่ำกว่า" → ส่วนต่าง = กำไร/ค่าบริการของพาร์ทเนอร์
 * - ผู้ขายได้เงิน "เต็ม" ตามราคาที่พาร์ทเนอร์รับซื้อ (ไม่หัก)
 * - บริษัทเก็บ "ค่าคอม" เป็น % ของยอดรับซื้อ โดย "หักจากเครดิต" ของผู้รับซื้อ
 * - ต้องมีเครดิต ≥ MIN_CREDIT ถึงจะรับงานได้ · ติดลบ = รับงานไม่ได้
 */
export const COMPANY_COMMISSION_RATE = 0.02; // ค่าคอมบริษัท (หักจากเครดิต)
export const MIN_CREDIT = 300; // เครดิตขั้นต่ำเพื่อรับงาน

/**
 * พร้อมเพย์บริษัท (ปลายทางเติมเครดิต) — ต้องตั้งผ่าน env เท่านั้น
 * 🔒 fail-closed: ไม่ตั้ง/รูปแบบผิด = ปิดช่องทางเติมเครดิต ห้าม fallback เป็นเลขตัวอย่าง
 * เพราะ QR จะพาผู้ใช้โอน "เงินจริง" เข้าบัญชีคนอื่น (lib/promptpay.ts ไม่ validate ให้)
 * รับได้: เบอร์มือถือ 10 หลัก (0xxxxxxxxx) หรือเลขบัตรประชาชน 13 หลัก
 */
export const COMPANY_PROMPTPAY = (process.env.NEXT_PUBLIC_COMPANY_PROMPTPAY ?? "").replace(/\D/g, "");
export const promptPayConfigured = /^0\d{9}$/.test(COMPANY_PROMPTPAY) || /^\d{13}$/.test(COMPANY_PROMPTPAY);
export const COMPANY_NAME = "Recycle Fund";
export const TOPUP_PRESETS = [300, 500, 1000, 2000]; // จำนวนเติมด่วน

export const BAHT_PER_TICKET = 100; // ผู้ขายขาย 100 บาท = 1 สิทธิ์
export const MAX_TICKETS_PER_JOB = 50;
export const MAX_TICKETS_PER_MONTH = 300;

export interface Settlement {
  goods: number; // ราคาที่พาร์ทเนอร์รับซื้อ (= จ่ายผู้ขายเต็ม)
  fee: number; // ค่าคอมบริษัท (หักจากเครดิตพาร์ทเนอร์)
  sellerNet: number; // = goods (ผู้ขายได้เต็ม)
  tickets: number;
}

export function computeSettlement(goods: number): Settlement {
  const g = Math.max(0, Math.round(goods || 0));
  const fee = Math.round(g * COMPANY_COMMISSION_RATE);
  const tickets = Math.min(MAX_TICKETS_PER_JOB, Math.floor(g / BAHT_PER_TICKET));
  return { goods: g, fee, sellerNet: g, tickets };
}

export const feeRateLabel = `${Math.round(COMPANY_COMMISSION_RATE * 100)}%`;

/** ค่าคอมแพลตฟอร์ม = ค่าคอมบริษัท (ใช้ในหน้าแอดมิน) */
export const PLATFORM_RATE = COMPANY_COMMISSION_RATE;
export const platformRateLabel = feeRateLabel;
