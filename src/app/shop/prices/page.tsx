"use client";

import { useStore } from "@/lib/store";
import { MATERIALS, CATEGORIES } from "@/lib/materials";
import { buyerPrice } from "@/lib/selectors";
import { formatBaht } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { MaterialThumb } from "@/components/MaterialThumb";

export default function ShopPricesPage() {
  const { db, currentUser, setBuyerPrice } = useStore();
  const u = currentUser!;
  const custom = db.buyerPrices[u.id] || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">ราคา / วัสดุ</h1>
        <p className="text-sm text-neutral-500">ตั้งราคารับซื้อของร้าน — ใช้คำนวณมูลค่างานและยอดจ่ายผู้ขาย</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="card">
            <p className="mb-3 font-bold text-neutral-800">{cat}</p>
            <div className="divide-y divide-neutral-100">
              {MATERIALS.filter((m) => m.category === cat).map((m) => {
                const price = buyerPrice(db, u.id, m.id);
                const isCustom = custom[m.id] != null;
                return (
                  <div key={m.id} className="flex items-center gap-3 py-2.5">
                    <MaterialThumb id={m.id} emoji={m.emoji} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">{m.name}</p>
                      <p className="text-xs text-neutral-400">
                        อัตราเลทโรงงาน ฿{formatBaht(m.pricePerUnit)}/{m.unit}
                        {isCustom && <span className="ml-1 font-medium text-brand-600">· ปรับแล้ว</span>}
                      </p>
                    </div>
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">฿</span>
                      <input
                        className="input !py-2 pl-7 pr-2 text-right text-sm font-bold"
                        inputMode="numeric"
                        value={String(price)}
                        onChange={(e) => setBuyerPrice(m.id, Number(e.target.value.replace(/\D/g, "")) || 0)}
                      />
                    </div>
                    <span className="w-10 text-xs text-neutral-400">/{m.unit}</span>
                    {isCustom ? (
                      <button onClick={() => setBuyerPrice(m.id, m.pricePerUnit)} className="text-neutral-400 hover:bg-neutral-100" title="ใช้อัตราเลทโรงงาน">
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
