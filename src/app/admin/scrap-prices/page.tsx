"use client";

import { useStore } from "@/lib/store";
import { MATERIALS, CATEGORIES } from "@/lib/materials";
import { centralPrice } from "@/lib/selectors";
import { formatBaht } from "@/lib/utils";
import { RotateCcw, Tag, PackageSearch } from "lucide-react";
import { MaterialThumb } from "@/components/MaterialThumb";

export default function AdminScrapPricesPage() {
  const { db, setCentralPrice } = useStore();
  const custom = db.centralPrices || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">กำหนดราคาของเก่า</h1>
        <p className="text-sm text-neutral-500">บริษัทตั้งราคารับซื้อของเก่า (บาท/กก.) · ศูนย์คัดแยกใช้ราคานี้ตีราคาถุงเพื่อให้คะแนนคนทิ้ง</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 ring-1 ring-brand-100">
        <PackageSearch className="mt-0.5 h-4 w-4 shrink-0" />
        <p>ปรับราคาที่นี่แล้วมีผลทันทีกับหน้า “ตีราคา” ของศูนย์คัดแยกทุกศูนย์</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="card">
            <p className="mb-3 flex items-center gap-1.5 font-bold text-neutral-800"><Tag className="h-4 w-4 text-brand-600" /> {cat}</p>
            <div className="divide-y divide-neutral-100">
              {MATERIALS.filter((m) => m.category === cat).map((m) => {
                const price = centralPrice(db, m.id);
                const isCustom = custom[m.id] != null;
                return (
                  <div key={m.id} className="flex items-center gap-3 py-2.5">
                    <MaterialThumb id={m.id} emoji={m.emoji} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">{m.name}</p>
                      <p className="text-xs text-neutral-400">
                        ค่าตั้งต้น ฿{formatBaht(m.pricePerUnit)}/{m.unit}
                        {isCustom && <span className="ml-1 font-medium text-brand-600">· ปรับแล้ว</span>}
                      </p>
                    </div>
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">฿</span>
                      <input
                        className="input !py-2 pl-7 pr-2 text-right text-sm font-bold"
                        inputMode="numeric"
                        value={String(price)}
                        onChange={(e) => setCentralPrice(m.id, Number(e.target.value.replace(/\D/g, "")) || 0)}
                      />
                    </div>
                    <span className="w-10 text-xs text-neutral-400">/{m.unit}</span>
                    {isCustom ? (
                      <button onClick={() => setCentralPrice(m.id, m.pricePerUnit)} className="text-neutral-400 hover:bg-neutral-100" title="คืนค่าตั้งต้น">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="w-4" />
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
