"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { platformSummary } from "@/lib/selectors";
import { formatBaht, thaiMonthLabel } from "@/lib/utils";
import { platformRateLabel } from "@/lib/fees";
import { TrendingUp, Coins, Users, Receipt, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const { db } = useStore();
  const p = platformSummary(db);
  const maxMonth = Math.max(1, ...p.byMonth.map((m) => m.gmv));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">ภาพรวมระบบ</h1>
        <p className="text-sm text-neutral-500">รายได้และกิจกรรมของผู้ซื้อทุกคน</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<TrendingUp className="h-5 w-5" />} label="GMV รวม (มูลค่าซื้อขาย)" value={`฿${formatBaht(p.gmv)}`} sub={`${p.billCount} บิล`} tone="brand" />
        <Stat icon={<Coins className="h-5 w-5" />} label={`ค่าคอมแพลตฟอร์ม (${platformRateLabel})`} value={`฿${formatBaht(p.commission)}`} tone="gold" />
        <Stat icon={<Users className="h-5 w-5" />} label="ผู้ซื้อ / ผู้ขาย" value={`${p.buyerCount} / ${p.sellerCount}`} />
        <Stat icon={<Receipt className="h-5 w-5" />} label="บิลทั้งหมด" value={`${p.billCount}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* monthly GMV */}
        <div className="card">
          <h2 className="mb-4 font-bold text-neutral-800">GMV รายเดือน</h2>
          {p.byMonth.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="space-y-3">
              {p.byMonth.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs text-neutral-500">{thaiMonthLabel(m.month)}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div className="flex h-full items-center justify-end rounded-full bg-brand-500 px-2 text-[11px] font-bold text-white" style={{ width: `${Math.max(15, (m.gmv / maxMonth) * 100)}%` }}>
                      ฿{formatBaht(m.gmv)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* top buyers */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-neutral-800">ผู้ซื้อยอดสูงสุด</h2>
            <Link href="/admin/buyers" className="text-sm font-semibold text-brand-600">จัดการทั้งหมด</Link>
          </div>
          {p.byBuyer.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {p.byBuyer.slice(0, 6).map((b, i) => (
                <div key={b.buyerId} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">{b.name}</p>
                    <p className="text-xs text-neutral-400">{b.bills} บิล</p>
                  </div>
                  <span className="text-sm font-bold text-brand-700">฿{formatBaht(b.gmv)}</span>
                </div>
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
  tone?: "gold" | "brand";
}) {
  const toneCls =
    tone === "gold" ? "bg-gold/15 text-gold-dark" : tone === "brand" ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-neutral-500";
  return (
    <div className="card flex flex-col gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneCls}`}>{icon}</div>
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="mt-0.5 text-[26px] font-extrabold leading-tight tracking-tight text-neutral-800">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
      </div>
    </div>
  );
}
