"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { shopSummary, billsForBuyer, creditOf } from "@/lib/selectors";
import { formatBaht, thaiDateTime } from "@/lib/utils";
import { MIN_CREDIT } from "@/lib/fees";
import { ShoppingCart, HandCoins, Receipt, Coins, ChevronRight, Plus } from "lucide-react";

export default function ShopDashboard() {
  const { db, currentUser } = useStore();
  const u = currentUser!;
  const sum = shopSummary(db, u.id);
  const bills = billsForBuyer(db, u.id).slice(0, 6);
  const credit = creditOf(db, u.id);
  const maxDay = Math.max(1, ...sum.byDay.map((d) => d.amount));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">ภาพรวมร้าน</h1>
          <p className="text-sm text-neutral-500">สรุปการรับซื้อและรายได้</p>
        </div>
        <Link href="/shop/bills/new" className="btn-primary !px-4 !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> สร้างบิลรับซื้อ
        </Link>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<ShoppingCart className="h-5 w-5" />} label="รับซื้อวันนี้" value={`฿${formatBaht(sum.todayGoods)}`} sub={`${sum.todayBills} บิล`} tone="brand" />
        <Stat icon={<Receipt className="h-5 w-5" />} label="รับซื้อรวมทั้งหมด" value={`฿${formatBaht(sum.goodsTotal)}`} sub={`${sum.billCount} บิล`} />
        <Stat icon={<HandCoins className="h-5 w-5" />} label="จ่ายผู้ขายรวม" value={`฿${formatBaht(sum.netPaid)}`} sub={`ค่าคอมจ่ายบริษัท ฿${formatBaht(sum.fee)}`} />
        <Stat icon={<Coins className="h-5 w-5" />} label="เครดิตคงเหลือ" value={`฿${formatBaht(credit)}`} sub={credit >= MIN_CREDIT ? "พร้อมรับงาน" : `ต้อง ≥ ฿${MIN_CREDIT}`} tone={credit >= MIN_CREDIT ? "brand" : "danger"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 7-day chart */}
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-bold text-neutral-800">ยอดรับซื้อ 7 วันล่าสุด</h2>
          <div className="flex h-48 items-end gap-2">
            {sum.byDay.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-neutral-500">{d.amount > 0 ? formatBaht(d.amount) : ""}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-brand-500 transition-all"
                    style={{ height: `${(d.amount / maxDay) * 100}%`, minHeight: d.amount > 0 ? "4px" : "0" }}
                  />
                </div>
                <span className="text-[11px] text-neutral-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* recent bills */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-neutral-800">บิลล่าสุด</h2>
            <Link href="/shop/bills" className="text-sm font-semibold text-brand-600">ทั้งหมด</Link>
          </div>
          {bills.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">ยังไม่มีบิล</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {bills.map((b) => (
                <Link key={b.id} href={`/shop/bill/${b.id}`} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">{b.sellerName}</p>
                    <p className="text-xs text-neutral-400">{b.code} · {thaiDateTime(b.date)}</p>
                  </div>
                  <span className={b.status === "void" ? "text-sm text-neutral-400 line-through" : "text-sm font-bold text-brand-700"}>
                    ฿{formatBaht(b.goodsTotal)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "danger";
}) {
  return (
    <div className="card flex flex-col gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          tone === "brand" ? "bg-brand-100 text-brand-700" : tone === "danger" ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="mt-0.5 text-[26px] font-extrabold leading-tight tracking-tight text-neutral-800">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
      </div>
    </div>
  );
}
