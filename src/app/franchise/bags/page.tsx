"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { bagsForFranchise } from "@/lib/selectors";
import { BAG_STATUS_META } from "@/lib/types";
import type { BagStatus } from "@/lib/types";
import { formatBaht, thaiDateTime } from "@/lib/utils";
import { ArrowLeft, Box, Search } from "lucide-react";

type Filter = "all" | BagStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "dropped", label: "รอคัดแยก" },
  { key: "sorting", label: "กำลังคัดแยก" },
  { key: "credited", label: "ได้คะแนนแล้ว" },
];

export default function FranchiseBagsPage() {
  const { db, currentUser } = useStore();
  const frId = currentUser?.franchiseId ?? "";
  const all = bagsForFranchise(db, frId);

  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => ({
    all: all.length,
    dropped: all.filter((b) => b.status === "dropped").length,
    sorting: all.filter((b) => b.status === "sorting").length,
    credited: all.filter((b) => b.status === "credited").length,
  }), [all]);

  const rows = all.filter((b) => (filter === "all" || b.status === filter) && (!q || b.qr.toLowerCase().includes(q.toLowerCase()) || b.userName.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/franchise" className="mb-1 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> แดชบอร์ด</Link>
          <h1 className="text-2xl font-bold text-neutral-800">ถุงทั้งหมด</h1>
          <p className="text-sm text-neutral-500">{counts.all} ถุง · รอคัดแยก {counts.dropped + counts.sorting} · ได้คะแนนแล้ว {counts.credited}</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input className="input pl-9" placeholder="ค้นหา QR หรือชื่อผู้ทิ้ง" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${filter === f.key ? "bg-brand-600 text-white" : "bg-white text-neutral-500 ring-1 ring-neutral-200 hover:bg-neutral-50"}`}
          >
            {f.label} <span className="opacity-70">({f.key === "all" ? counts.all : counts[f.key]})</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-900/[0.04]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-2.5 font-medium">QR ถุง</th>
              <th className="px-4 py-2.5 font-medium">ผู้ทิ้ง</th>
              <th className="px-4 py-2.5 font-medium">หย่อนเมื่อ</th>
              <th className="px-4 py-2.5 text-right font-medium">มูลค่า / คะแนน</th>
              <th className="px-4 py-2.5 font-medium">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const m = BAG_STATUS_META[b.status];
              return (
                <tr key={b.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-mono font-medium text-neutral-800">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Box className="h-4 w-4" /></span>
                      {b.qr}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{b.userName || "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">{thaiDateTime(b.droppedAt)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {b.status === "credited" ? <span className="font-semibold text-brand-700">฿{formatBaht(b.valueBaht ?? 0)} · {formatBaht(b.points ?? 0)} pt</span> : <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-4 py-3"><span className={`chip ${m.color}`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} /> {m.label}</span></td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-neutral-400">ไม่พบถุงตามเงื่อนไข</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
