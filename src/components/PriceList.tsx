import { MATERIALS } from "@/lib/materials";
import { formatBaht } from "@/lib/utils";
import { MaterialThumb } from "@/components/MaterialThumb";

export function PriceList({ limit, priceOf }: { limit?: number; priceOf?: (materialId: string) => number }) {
  const list = limit ? MATERIALS.slice(0, limit) : MATERIALS;
  return (
    <div className="divide-y divide-neutral-100">
      {list.map((m) => {
        const price = priceOf ? priceOf(m.id) : m.pricePerUnit;
        return (
          <div key={m.id} className="flex items-center gap-3 py-2.5">
            <MaterialThumb id={m.id} emoji={m.emoji} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-800">{m.name}</p>
              <p className="text-xs text-neutral-400">{m.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-brand-700">฿{formatBaht(price)}</p>
              <p className="text-xs text-neutral-400">/ {m.unit}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
