"use client";

import { useStore } from "@/lib/store";
import { franchisePayoutsFor, franchiseRevenue } from "@/lib/selectors";
import { formatBaht, thaiDateTime } from "@/lib/utils";
import { Banknote, ArrowDownCircle, Wallet } from "lucide-react";

export default function FranchiseIncomePage() {
  const { db, currentUser } = useStore();
  const frId = currentUser?.franchiseId ?? "";
  const income = franchisePayoutsFor(db, frId);
  const totalIn = income.reduce((s, p) => s + p.amount, 0);
  const rev = franchiseRevenue(db, frId);
  const outstanding = Math.max(0, Math.round(rev.franchiseShare - totalIn));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">ประวัติเงินเข้า</h1>
        <p className="text-sm text-neutral-500">เงินที่บริษัทโอนส่วนแบ่งรายได้ให้แฟรนไชส์ของคุณ</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card icon={<Wallet className="h-5 w-5" />} label="ส่วนแบ่งสะสม" value={`฿${formatBaht(rev.franchiseShare)}`} />
        <Card icon={<ArrowDownCircle className="h-5 w-5" />} label="รับแล้ว" value={`฿${formatBaht(totalIn)}`} tone="brand" />
        <Card icon={<Banknote className="h-5 w-5" />} label="รอรับ" value={`฿${formatBaht(outstanding)}`} tone={outstanding > 0 ? "amber" : undefined} />
      </div>

      <div className="card">
        <h2 className="mb-3 flex items-center gap-1.5 font-bold text-neutral-800"><Banknote className="h-4 w-4 text-brand-600" /> รายการเงินเข้า</h2>
        {income.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-400">ยังไม่มีเงินโอนเข้าจากบริษัท</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {income.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><ArrowDownCircle className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-neutral-800">โอนส่วนแบ่งรายได้</p>
                  <p className="text-xs text-neutral-400">{thaiDateTime(p.paidAt)}{p.note ? ` · ${p.note}` : ""}</p>
                </div>
                <p className="text-lg font-bold text-brand-700">+฿{formatBaht(p.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "brand" | "amber" }) {
  const ring = tone === "brand" ? "bg-brand-100 text-brand-700" : tone === "amber" ? "bg-amber-100 text-amber-600" : "bg-neutral-100 text-neutral-500";
  return (
    <div className="card">
      <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${ring}`}>{icon}</span>
      <p className="text-xl font-extrabold text-neutral-800">{value}</p>
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  );
}
