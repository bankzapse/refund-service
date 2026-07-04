export type Role = "seller" | "buyer" | "admin";

export type JobStatus =
  | "submitted" // ส่งงาน — ผู้ขายสร้าง รอผู้ซื้อรับ
  | "confirmed" // คอนเฟิร์มงาน — ผู้ซื้อรับงานแล้ว
  | "en_route" // กำลังไปรับ
  | "completed" // งานสำเร็จ
  | "cancelled"; // ยกเลิกงาน

export interface Material {
  id: string;
  name: string;
  unit: string; // กก. / ใบ / อัน
  pricePerUnit: number;
  emoji: string;
  category: string;
}

export interface JobItem {
  materialId: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  qty: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface StatusEvent {
  status: JobStatus;
  at: string;
  note?: string;
}

export interface Job {
  id: string;
  code: string; // RF-XXXX
  sellerId: string;
  sellerName: string;
  buyerId?: string;
  buyerName?: string;
  items: JobItem[];
  estimatedTotal: number;
  location: GeoLocation;
  houseNo: string;
  landmark: string;
  contactName: string;
  contactPhone: string;
  scheduledDate: string; // YYYY-MM-DD (จองเป็น "วัน" ไม่ระบุเวลา)
  note?: string;
  status: JobStatus;
  history: StatusEvent[];
  finalAmount?: number;
  createdAt: string;
}

export interface ScheduleSlot {
  id: string;
  buyerId: string;
  buyerName: string;
  date: string; // YYYY-MM-DD (รอบเข้ารับทั้งวัน)
  area: string; // โซน/ตำบล
  capacity: number;
  booked: number;
}

export interface RewardTicket {
  id: string;
  number: string; // 6 หลัก
  userId: string;
  month: string; // YYYY-MM
  fromJobId?: string;
}

export interface RewardDraw {
  month: string; // YYYY-MM
  prizeName: string;
  prizeValue: number;
  winningNumber: string;
  winnerName?: string;
  announcedAt?: string;
  status: "pending" | "announced";
}

export interface User {
  id: string;
  role: Role;
  name: string;
  phone: string;
  email?: string;
  lineUserId?: string;
  lineConnected: boolean;
  baseLat?: number; // ตำแหน่งฐานคนขับ (ใช้คำนวณรัศมี 30 กม.)
  baseLng?: number;
  status?: "active" | "suspended"; // สถานะบัญชี (แอดมินจัดการ) — ไม่ระบุ = active
  credit?: number; // เครดิตของผู้รับซื้อ (พาร์ทเนอร์) — ต้อง ≥ 300 ถึงรับงานได้
  partner?: boolean; // เป็นพาร์ทเนอร์กับโรงงานแล้ว (ได้อัตราเลท)
  createdAt: string;
}

export const STATUS_META: Record<
  JobStatus,
  { label: string; color: string; dot: string; step: number }
> = {
  submitted: { label: "ส่งงาน", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500", step: 1 },
  confirmed: { label: "คอนเฟิร์มแล้ว", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500", step: 2 },
  en_route: { label: "กำลังไปรับ", color: "bg-violet-100 text-violet-700", dot: "bg-violet-500", step: 3 },
  completed: { label: "สำเร็จ", color: "bg-brand-100 text-brand-700", dot: "bg-brand-600", step: 4 },
  cancelled: { label: "ยกเลิก", color: "bg-neutral-200 text-neutral-500", dot: "bg-neutral-400", step: 0 },
};

export interface BillItem {
  materialId: string;
  name: string;
  unit: string;
  qty: number; // น้ำหนัก/จำนวน
  pricePerUnit: number;
  subtotal: number;
}

export interface Bill {
  id: string;
  code: string; // B-XXXX
  buyerId: string; // ร้านที่ออกบิล
  source: "app_job" | "walk_in";
  jobId?: string;
  sellerName: string;
  sellerPhone: string;
  date: string; // ISO
  items: BillItem[];
  goodsTotal: number; // ยอดรับซื้อ
  fee: number; // ค่าบริการ
  netPaid: number; // จ่ายผู้ขายสุทธิ
  paymentMethod: "cash" | "transfer" | "promptpay";
  status: "paid" | "void";
  createdAt: string;
}

export interface Expense {
  id: string;
  buyerId: string;
  category: string; // น้ำมัน / ค่าแรง / ค่าเช่า / อื่นๆ
  amount: number;
  date: string; // ISO
  note?: string;
  createdAt: string;
}

export interface WalletTxn {
  id: string;
  buyerId: string;
  type: "topup" | "commission" | "adjust"; // เติมเงิน / หักค่าคอม / ปรับโดยแอดมิน
  amount: number; // + เข้า, − ออก
  balanceAfter: number;
  note?: string;
  jobId?: string;
  date: string; // ISO
}
