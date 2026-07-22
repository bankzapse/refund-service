import Link from "next/link";
import type { Job } from "@/lib/types";
import { StatusBadge } from "./ui";
import { MATERIAL_MAP } from "@/lib/materials";
import { MaterialThumb } from "./MaterialThumb";
import { formatBaht, thaiDateShort } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";
import { MapPin, CalendarClock, ChevronRight } from "lucide-react";

export function JobCard({
  job,
  perspective = "seller",
  distanceKm,
}: {
  job: Job;
  perspective?: "seller" | "buyer";
  distanceKm?: number;
}) {
  const hasItems = job.items.length > 0;
  const icons = hasItems ? job.items.slice(0, 4).map((i) => i.materialId) : [""];
  const itemsLabel = hasItems ? job.items.map((i) => i.name).join(" · ") : "ยังไม่ระบุรายการ · ตกลงหน้างาน";
  const total = job.finalAmount ?? job.estimatedTotal;

  return (
    <Link href={`/job/${job.id}`} className="card block transition active:scale-[0.99] hover:shadow-float">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-neutral-400">{job.code}</span>
          {distanceKm != null && (
            <span className="chip bg-blue-50 text-blue-700">
              <MapPin className="h-3 w-3" /> {formatDistance(distanceKm)}
            </span>
          )}
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex items-start gap-3">
        <div className="flex shrink-0 -space-x-1.5">
          {icons.map((id, i) => (
            <span key={i} className="rounded-full ring-2 ring-white">
              <MaterialThumb id={id} emoji={MATERIAL_MAP[id]?.emoji} size="h-8 w-8" rounded="rounded-full" />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-800">{itemsLabel}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
            <CalendarClock className="h-3.5 w-3.5" />
            นัดรับ {thaiDateShort(job.scheduledDate)}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.location.address}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
        <span className="text-xs text-neutral-400">
          {perspective === "seller"
            ? job.buyerName
              ? `ผู้ซื้อ: ${job.buyerName}`
              : "รอผู้ซื้อรับงาน"
            : `ผู้ขาย: ${job.sellerName}`}
        </span>
        {!hasItems && job.finalAmount == null ? (
          <span className="flex items-center gap-0.5 text-xs font-medium text-neutral-400">
            ตกลงหน้างาน
            <ChevronRight className="h-4 w-4 text-neutral-300" />
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-sm font-bold text-brand-700">
            {job.finalAmount != null ? "" : "~"}฿{formatBaht(total)}
            <ChevronRight className="h-4 w-4 text-neutral-300" />
          </span>
        )}
      </div>
    </Link>
  );
}
