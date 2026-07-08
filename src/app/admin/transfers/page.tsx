"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatBaht, thaiDateTime } from "@/lib/utils";
import { Banknote, User, Building2, ArrowUpRight } from "lucide-react";

type Row = { id: string; kind: "seller" | "franchise"; name: string; amount: number; ref: string; note?: string; at: string };

export default function AdminTransfersPage() {
  const { db } = useStore();
  const [filter, setFilter] = useState<"all" | "seller" | "franchise">("all");

  const rows = useMemo<Row[]>(() => {
    const sellerRows: Row[] = db.redemptions
      .filter((r) => r.status === "paid")
      .map((r) => ({ id: r.id, kind: "seller", name: r.userName, amount: r.amountBaht, ref: r.code, note: `พร้อมเพย์ ${r.account}`, at: r.paidAt ?? r.requestedAt }));
    const frRows: Row[] = (db.franchisePayouts ?? []).map((p) => ({ id: p.id, kind: "franchise", name: p.franchiseName, amount: p.amount, ref: "ส่วนแบ่งรายได้", note: p.note, at: p.paidAt }));
    return [...sellerRows, ...frRows].sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [db.redemptions, db.franchisePayouts]);

  const shown = rows.filter((r) => filter === "all" || r.kind === filter);
  const total = shown.reduce((s, r) => s + r.amount, 0);
  const toSellers = rows.filter((r) => r.kind === "seller").reduce((s, r) => s + r.amount, 0);
  const toFranchises = rows.filter((r) => r.kind === "franchise").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">ประวัติการโอน</h1>
        <p className="text-sm text-neutral-500">เงินที่บริษัทโอนออกให้ผู้ขาย (แลกคะแนน) และแฟรนไชส์ (ส่วนแบ่ง)</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card label="โอนออกทั้งหมด" value={`฿${formatBaht(toSellers + toFranchises)}`} tone="brand" />
        <Card label="ให้ผู้ขาย" value={`฿${formatBaht(toSellers)}`} />
        <Card label="ให้แฟรนไชส์" value={`฿${formatBaht(toFranchises)}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "seller", "franchise"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${filter === f ? "bg-brand-600 text-white" : "bg-white text-neutral-500 ring-1 ring-neutral-200 hover:bg-neutral-50"}`}
          >
            {f === "all" ? "ทั้งหมด" : f === "seller" ? "ผู้ขาย" : "แฟรนไชส์"}
          </button>
        ))}
        <span className="ml-auto text-sm text-neutral-500">รวมที่แสดง <b className="text-neutral-800">฿{formatBaht(total)}</b></span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-900/[0.04]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-2.5 font-medium">ผู้รับ</th>
              <th className="px-4 py-2.5 font-medium">ประเภท / อ้างอิง</th>
              <th className="px-4 py-2.5 font-medium">วันที่โอน</th>
              <th className="px-4 py-2.5 text-right font-medium">จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-neutral-800">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${r.kind === "franchise" ? "bg-brand-50 text-brand-600" : "bg-neutral-100 text-neutral-500"}`}>
                      {r.kind === "franchise" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </span>
                    {r.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  <span className="block">{r.kind === "seller" ? "แลกคะแนน" : "ส่วนแบ่งรายได้"} · {r.ref}</span>
                  {r.note && <span className="text-xs text-neutral-400">{r.note}</span>}
                </td>
                <td className="px-4 py-3 text-neutral-500">{thaiDateTime(r.at)}</td>
                <td className="px-4 py-3 text-right"><span className="inline-flex items-center gap-0.5 font-bold text-brand-700"><ArrowUpRight className="h-4 w-4" />฿{formatBaht(r.amount)}</span></td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={4} className="py-12 text-center text-neutral-400"><Banknote className="mx-auto mb-2 h-8 w-8" /> ยังไม่มีประวัติการโอน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone?: "brand" }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${tone === "brand" ? "bg-brand-50 ring-brand-100" : "bg-white ring-neutral-900/[0.04]"}`}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-extrabold ${tone === "brand" ? "text-brand-700" : "text-neutral-800"}`}>{value}</p>
    </div>
  );
}
