import type { Bill, BillItem, Expense, Job, RewardDraw, RewardTicket, ScheduleSlot, User, WalletTxn } from "./types";
import { MATERIALS, MATERIAL_MAP } from "./materials";
import { currentMonth, uid } from "./utils";
import { computeSettlement } from "./fees";

export interface DB {
  users: User[];
  jobs: Job[];
  slots: ScheduleSlot[];
  tickets: RewardTicket[];
  draws: RewardDraw[];
  bills: Bill[];
  expenses: Expense[];
  wallet: WalletTxn[]; // ธุรกรรมเครดิตของผู้รับซื้อ
  buyerPrices: Record<string, Record<string, number>>; // buyerId → materialId → ราคารับซื้อ
  centralPrices: Record<string, number>; // ราคากลาง (แอดมินตั้ง) → override ค่า default
  pricesUpdatedAt: string;
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function item(id: string, qty: number) {
  const m = MATERIAL_MAP[id];
  return { materialId: id, name: m.name, unit: m.unit, pricePerUnit: m.pricePerUnit, qty };
}
function estTotal(items: { pricePerUnit: number; qty: number }[]) {
  return items.reduce((s, i) => s + i.pricePerUnit * i.qty, 0);
}

/** สร้างฐานข้อมูลตั้งต้น (dates สัมพันธ์กับวันนี้ เพื่อให้เดโมสมจริง) */
export function createInitialDB(): DB {
  const now = new Date();
  const month = currentMonth();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(
    lastMonthDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const seller: User = {
    id: "u-seller",
    role: "seller",
    name: "คุณมานี ใจดี",
    phone: "0812345678",
    email: "seller@demo.com",
    lineConnected: false,
    createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 3).toISOString(),
  };
  const seller2: User = {
    id: "u-seller2",
    role: "seller",
    name: "ร้านกาแฟบ้านสวน",
    phone: "0898887777",
    lineConnected: true,
    lineUserId: "Uxxxxdemo2",
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 12).toISOString(),
  };
  const buyer: User = {
    id: "u-buyer",
    role: "buyer",
    name: "สมชาย รับซื้อของเก่า",
    phone: "0876543210",
    email: "buyer@demo.com",
    lineConnected: true,
    lineUserId: "Uxxxxdemo",
    baseLat: 13.7997,
    baseLng: 100.5537,
    credit: 520,
    partner: true,
    createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(),
  };
  const buyer2: User = {
    id: "u-buyer2",
    role: "buyer",
    name: "รุ่งเรืองรีไซเคิล",
    phone: "0801119999",
    lineConnected: false,
    baseLat: 13.7280,
    baseLng: 100.5241,
    credit: 150,
    partner: true,
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(),
  };
  const admin: User = {
    id: "u-admin",
    role: "admin",
    name: "ผู้ดูแลระบบ",
    phone: "0900000000",
    email: "admin@demo.com",
    lineConnected: false,
    createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(),
  };

  const loc = (address: string): Job["location"] => ({
    lat: 13.7563 + (Math.random() - 0.5) * 0.05,
    lng: 100.5018 + (Math.random() - 0.5) * 0.05,
    address,
  });

  const j1items = [item("glass-bottle", 20), item("cardboard", 15)];
  const j2items = [item("beer-crate", 4), item("pet", 8)];
  const j3items = [item("steel", 30), item("aluminum-can", 5)];
  const j4items = [item("cardboard", 40), item("paper-white", 10)];
  const j5items = [item("pet", 12), item("plastic-mixed", 6)];
  const j7items = [item("newspaper", 25), item("cardboard", 20)];

  const jobs: Job[] = [
    {
      id: "j1",
      code: "RF-1042",
      sellerId: seller.id,
      sellerName: seller.name,
      items: j1items,
      estimatedTotal: estTotal(j1items),
      location: loc("ซ.ลาดพร้าว 15 แขวงจอมพล เขตจตุจักร"),
      houseNo: "88/12",
      landmark: "ตรงข้ามร้านสะดวกซื้อ",
      contactName: seller.name,
      contactPhone: seller.phone,
      scheduledDate: ymd(addDays(now, 1)),      note: "มีของเยอะ ช่วยเอารถกระบะมา",
      status: "submitted",
      history: [{ status: "submitted", at: new Date(now.getTime() - 2 * 3600e3).toISOString() }],
      createdAt: new Date(now.getTime() - 2 * 3600e3).toISOString(),
    },
    {
      id: "j2",
      code: "RF-1039",
      sellerId: seller.id,
      sellerName: seller.name,
      buyerId: buyer.id,
      buyerName: buyer.name,
      items: j2items,
      estimatedTotal: estTotal(j2items),
      location: loc("ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง"),
      houseNo: "45",
      landmark: "ปากซอยมีต้นมะม่วง",
      contactName: seller.name,
      contactPhone: seller.phone,
      scheduledDate: ymd(addDays(now, 1)),      status: "confirmed",
      history: [
        { status: "submitted", at: new Date(now.getTime() - 26 * 3600e3).toISOString() },
        { status: "confirmed", at: new Date(now.getTime() - 20 * 3600e3).toISOString(), note: "รับงานแล้ว เจอกันพรุ่งนี้บ่าย" },
      ],
      createdAt: new Date(now.getTime() - 26 * 3600e3).toISOString(),
    },
    {
      id: "j3",
      code: "RF-1035",
      sellerId: seller2.id,
      sellerName: seller2.name,
      buyerId: buyer.id,
      buyerName: buyer.name,
      items: j3items,
      estimatedTotal: estTotal(j3items),
      location: loc("ซ.อารีย์ แขวงสามเสนใน เขตพญาไท"),
      houseNo: "12/3",
      landmark: "ร้านกาแฟชั้นล่าง",
      contactName: seller2.name,
      contactPhone: seller2.phone,
      scheduledDate: ymd(now),      status: "en_route",
      history: [
        { status: "submitted", at: new Date(now.getTime() - 48 * 3600e3).toISOString() },
        { status: "confirmed", at: new Date(now.getTime() - 30 * 3600e3).toISOString() },
        { status: "en_route", at: new Date(now.getTime() - 1 * 3600e3).toISOString(), note: "กำลังเดินทางไปรับ" },
      ],
      createdAt: new Date(now.getTime() - 48 * 3600e3).toISOString(),
    },
    {
      id: "j4",
      code: "RF-1021",
      sellerId: seller.id,
      sellerName: seller.name,
      buyerId: buyer.id,
      buyerName: buyer.name,
      items: j4items,
      estimatedTotal: estTotal(j4items),
      location: loc("ซ.ลาดพร้าว 15"),
      houseNo: "88/12",
      landmark: "ตรงข้ามร้านสะดวกซื้อ",
      contactName: seller.name,
      contactPhone: seller.phone,
      scheduledDate: ymd(addDays(now, -3)),      status: "completed",
      finalAmount: 320,
      history: [
        { status: "submitted", at: new Date(now.getTime() - 96 * 3600e3).toISOString() },
        { status: "confirmed", at: new Date(now.getTime() - 90 * 3600e3).toISOString() },
        { status: "en_route", at: new Date(now.getTime() - 74 * 3600e3).toISOString() },
        { status: "completed", at: new Date(now.getTime() - 72 * 3600e3).toISOString(), note: "รับของเรียบร้อย จ่าย 320 บาท" },
      ],
      createdAt: new Date(now.getTime() - 96 * 3600e3).toISOString(),
    },
    {
      id: "j5",
      code: "RF-1018",
      sellerId: seller.id,
      sellerName: seller.name,
      buyerId: buyer2.id,
      buyerName: buyer2.name,
      items: j5items,
      estimatedTotal: estTotal(j5items),
      location: loc("ซ.ลาดพร้าว 15"),
      houseNo: "88/12",
      landmark: "-",
      contactName: seller.name,
      contactPhone: seller.phone,
      scheduledDate: ymd(addDays(now, -8)),      status: "completed",
      finalAmount: 150,
      history: [
        { status: "submitted", at: new Date(now.getTime() - 200 * 3600e3).toISOString() },
        { status: "completed", at: new Date(now.getTime() - 190 * 3600e3).toISOString(), note: "จ่าย 150 บาท" },
      ],
      createdAt: new Date(now.getTime() - 200 * 3600e3).toISOString(),
    },
    {
      id: "j7",
      code: "RF-1044",
      sellerId: seller2.id,
      sellerName: seller2.name,
      items: j7items,
      estimatedTotal: estTotal(j7items),
      location: loc("ถ.พหลโยธิน แขวงลาดยาว เขตจตุจักร"),
      houseNo: "199",
      landmark: "อาคารสำนักงานชั้น 1",
      contactName: seller2.name,
      contactPhone: seller2.phone,
      scheduledDate: ymd(addDays(now, 2)),      status: "submitted",
      history: [{ status: "submitted", at: new Date(now.getTime() - 5 * 3600e3).toISOString() }],
      createdAt: new Date(now.getTime() - 5 * 3600e3).toISOString(),
    },
  ];

  // ตารางรอบเข้ารับของผู้ซื้อ (7 วันข้างหน้า)
  const slots: ScheduleSlot[] = [];
  const areas = ["จตุจักร / ลาดพร้าว", "พญาไท / อารีย์", "ดินแดง / ห้วยขวาง"];
  [buyer, buyer2].forEach((b, bi) => {
    for (let d = 0; d < 4; d++) {
      const date = ymd(addDays(now, d + 1));
      slots.push({
        id: `slot-${b.id}-${d}`,
        buyerId: b.id,
        buyerName: b.name,
        date,
        area: areas[(bi + d) % areas.length],
        capacity: 8,
        booked: d === 0 ? 3 : d % 3,
      });
    }
  });

  // สิทธิ์ลุ้นรางวัลของผู้ขายเดโม (จาก j4=320→3 สิทธิ์, j5=150→1 สิทธิ์)
  const tickets: RewardTicket[] = [
    { id: "t1", number: "480216", userId: seller.id, month, fromJobId: "j4" },
    { id: "t2", number: "480217", userId: seller.id, month, fromJobId: "j4" },
    { id: "t3", number: "480218", userId: seller.id, month, fromJobId: "j4" },
    { id: "t4", number: "551903", userId: seller.id, month, fromJobId: "j5" },
  ];

  const draws: RewardDraw[] = [
    {
      month: lastMonth,
      prizeName: "ทองคำ 1 สลึง",
      prizeValue: 8000,
      winningNumber: "217480",
      winnerName: "คุณสมศรี ธ. (กรุงเทพฯ)",
      announcedAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      status: "announced",
    },
    {
      month,
      prizeName: "ทองคำ 1 สลึง",
      prizeValue: 8000,
      winningNumber: "",
      status: "pending",
    },
  ];

  // ---- บิลรับซื้อ + รายจ่าย (ร้านของ u-buyer) ----
  const billItem = (id: string, qty: number): BillItem => {
    const m = MATERIAL_MAP[id];
    return { materialId: id, name: m.name, unit: m.unit, qty, pricePerUnit: m.pricePerUnit, subtotal: m.pricePerUnit * qty };
  };
  const mkBill = (
    code: string,
    dayOffset: number,
    sellerName: string,
    sellerPhone: string,
    items: BillItem[],
    method: "cash" | "transfer",
  ): Bill => {
    const goods = items.reduce((s, i) => s + i.subtotal, 0);
    const st = computeSettlement(goods);
    const dt = addDays(now, dayOffset);
    return {
      id: uid("bill-"),
      code,
      buyerId: buyer.id,
      source: "walk_in",
      sellerName,
      sellerPhone,
      date: dt.toISOString(),
      items,
      goodsTotal: st.goods,
      fee: st.fee,
      netPaid: st.sellerNet,
      paymentMethod: method,
      status: "paid",
      createdAt: dt.toISOString(),
    };
  };
  const bills: Bill[] = [
    mkBill("B-2051", 0, "ป้าสมจิต (walk-in)", "0891112222", [billItem("cardboard", 45), billItem("paper-white", 12)], "cash"),
    mkBill("B-2050", 0, "ลุงมี (walk-in)", "0893334444", [billItem("steel", 60), billItem("aluminum-can", 8)], "cash"),
    mkBill("B-2048", -1, "ร้านข้าวแกงป้านิด", "0895556666", [billItem("pet", 20), billItem("plastic-mixed", 15)], "transfer"),
    mkBill("B-2045", -2, "คุณนภา", "0897778888", [billItem("glass-bottle", 30), billItem("beer-crate", 6)], "cash"),
    mkBill("B-2040", -4, "หมู่บ้านสุขใจ", "0899990000", [billItem("cardboard", 80), billItem("newspaper", 25)], "transfer"),
  ];

  const mkExpense = (cat: string, amount: number, dayOffset: number, note?: string): Expense => {
    const dt = addDays(now, dayOffset);
    return { id: uid("exp-"), buyerId: buyer.id, category: cat, amount, date: dt.toISOString(), note, createdAt: dt.toISOString() };
  };
  const expenses: Expense[] = [
    mkExpense("น้ำมัน", 350, 0, "เติมรถกระบะ"),
    mkExpense("ค่าแรง", 500, 0, "ลูกน้อง 1 คน"),
    mkExpense("ค่าเช่าโกดัง", 3000, -2),
    mkExpense("น้ำมัน", 300, -3),
  ];

  const wallet: WalletTxn[] = [];
  const mkWallet = (b: User, entries: { type: WalletTxn["type"]; amount: number; note: string; day: number }[]) => {
    let bal = 0;
    for (const e of entries) {
      bal += e.amount;
      wallet.push({ id: uid("w-"), buyerId: b.id, type: e.type, amount: e.amount, balanceAfter: bal, note: e.note, date: addDays(now, e.day).toISOString() });
    }
  };
  mkWallet(buyer, [
    { type: "topup", amount: 1000, note: "เติมเครดิตครั้งแรก (PromptPay)", day: -6 },
    { type: "commission", amount: -260, note: "ค่าคอมเคลียร์ยอด", day: -4 },
    { type: "topup", amount: 200, note: "เติมเครดิต (PromptPay)", day: -2 },
    { type: "commission", amount: -420, note: "ค่าคอมเคลียร์ยอด", day: -1 },
  ]);
  mkWallet(buyer2, [
    { type: "topup", amount: 300, note: "เติมเครดิต (PromptPay)", day: -3 },
    { type: "commission", amount: -150, note: "ค่าคอมเคลียร์ยอด", day: -1 },
  ]);

  return {
    users: [seller, seller2, buyer, buyer2, admin],
    jobs,
    slots,
    tickets,
    draws,
    bills,
    expenses,
    wallet,
    buyerPrices: {
      "u-buyer2": { cardboard: 5, pet: 12, steel: 9 },
    },
    centralPrices: {},
    pricesUpdatedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0).toISOString(),
  };
}

/** ราค่ากลาง (แอดมินแก้ได้ใน production; MVP ใช้จาก catalog) */
export const SEED_PRICES = MATERIALS;
