"use client";

import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { MATERIALS, CATEGORIES } from "@/lib/materials";
import { buyerPrice, centralPrice } from "@/lib/selectors";
import { formatBaht } from "@/lib/utils";
import { RotateCcw, Factory } from "lucide-react";
import { MaterialThumb } from "@/components/MaterialThumb";

export default function PricesPage() {
  const { db, currentUser, setBuyerPrice } = useStore();
  const u = currentUser!;
  const custom = db.buyerPrices[u.id] || {};

  return (
    <div>
      <AppHeader title="ตั้งราคารับซื้อ" subtitle="ราคาที่จ่ายผู้ขาย (บาท/หน่วย)" back />
      <div className="px-5 pb-28 pt-4">
        <div className="mb-4 rounded-2xl bg-blue-50 p-3.5 text-sm text-blue-800 ring-1 ring-blue-100">
          คุณเป็น <b>พาร์ทเนอร์</b> ได้ <b>อัตราเลทโรงงาน</b> — ตั้งราคาที่จ่ายผู้ขาย
          <b> ต่ำกว่าอัตราเลทโรงงาน</b> ส่วนต่างคือกำไรของคุณ (ระบบจำกัดไม่ให้เกินอัตราเลทโรงงาน)
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat} className="mb-4">
            <p className="mb-1.5 text-xs font-semibold text-neutral-400">{cat}</p>
            <div className="card divide-y divide-neutral-100 !p-2">
              {MATERIALS.filter((m) => m.category === cat).map((m) => {
                const depot = centralPrice(db, m.id); // อัตราเลทโรงงาน
                const price = Math.min(buyerPrice(db, u.id, m.id), depot);
                const isCustom = custom[m.id] != null;
                const margin = Math.max(0, depot - price);
                return (
                  <div key={m.id} className="flex items-center gap-2.5 px-1 py-2">
                    <MaterialThumb id={m.id} emoji={m.emoji} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">{m.name}</p>
                      <p className="flex items-center gap-1 text-xs text-neutral-400">
                        <Factory className="h-3 w-3" /> โรงงาน ฿{formatBaht(depot)}/{m.unit}
                        {margin > 0 && <span className="ml-1 font-medium text-brand-600">· กำไร ฿{formatBaht(margin)}</span>}
                      </p>
                    </div>
                    <div className="relative w-24">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400">฿</span>
                      <input
                        className="input !py-2 pl-6 pr-2 text-right text-sm font-bold"
                        inputMode="numeric"
                        value={String(price)}
                        onChange={(e) => {
                          const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                          setBuyerPrice(m.id, Math.min(v, depot)); // ห้ามเกินอัตราเลทโรงงาน
                        }}
                      />
                    </div>
                    {isCustom && (
                      <button
                        onClick={() => setBuyerPrice(m.id, depot)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100"
                        title="ใช้อัตราเลทโรงงาน"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
