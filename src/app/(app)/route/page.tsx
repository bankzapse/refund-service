"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/ui";
import { billableJobs } from "@/lib/selectors";
import { DEFAULT_BASE } from "@/lib/geo";
import { optimizeRoute, googleMapsDirUrl, routeEstimates, type RoutePoint, type OptimizedRoute } from "@/lib/route";
import { thaiDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Navigation, Route as RouteIcon, MapPin, Clock, Fuel, ChevronRight, Flag, CheckCircle2, Loader2 } from "lucide-react";

export default function RoutePage() {
  const { db, currentUser } = useStore();
  const u = currentUser!;
  const jobs = useMemo(() => billableJobs(db, u.id), [db, u.id]);
  const base = { lat: u.baseLat ?? DEFAULT_BASE.lat, lng: u.baseLng ?? DEFAULT_BASE.lng };

  const [selected, setSelected] = useState<Set<string>>(() => new Set(jobs.map((j) => j.id)));
  const [result, setResult] = useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"google" | "approx">("approx");

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const plan = async () => {
    const stops: RoutePoint[] = jobs
      .filter((j) => selected.has(j.id))
      .map((j) => ({ id: j.id, lat: j.location.lat, lng: j.location.lng, label: j.contactName || j.sellerName, sub: `${j.code} · ${j.location.address}` }));
    if (stops.length === 0) return;
    setLoading(true);
    let distances: number[][] | undefined;
    let durations: number[][] | undefined;
    try {
      const res = await fetch("/api/route/matrix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: [base, ...stops.map((s) => ({ lat: s.lat, lng: s.lng }))] }),
      });
      const j = await res.json();
      if (j.distances) {
        distances = j.distances;
        durations = j.durations;
      }
    } catch {
      /* fallback haversine */
    }
    setSource(distances ? "google" : "approx");
    setResult(optimizeRoute(base, stops, distances, durations));
    setLoading(false);
  };

  const est = result ? routeEstimates(result.totalKm, result.order.length, result.totalMin) : null;
  const jobById = (id: string) => jobs.find((j) => j.id === id);

  if (jobs.length === 0) {
    return (
      <div>
        <AppHeader title="จัดเส้นทางรับของ" back />
        <EmptyState icon="🗺️" title="ยังไม่มีงานที่ต้องไปรับ" hint="รับงาน/คอนเฟิร์มงานก่อน แล้วมาจัดเส้นทาง" />
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="จัดเส้นทางรับของ" subtitle={`${jobs.length} งานรอไปรับ`} back />
      <div className="px-5 pb-28 pt-4">
        <div className="card mb-4">
          <p className="mb-2 text-sm font-bold text-neutral-800">เลือกงานที่จะไปรับ</p>
          <div className="space-y-2">
            {jobs.map((j) => {
              const on = selected.has(j.id);
              return (
                <button
                  key={j.id}
                  onClick={() => toggle(j.id)}
                  className={cn("flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition", on ? "border-brand-400 bg-brand-50" : "border-neutral-200")}
                >
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", on ? "bg-brand-600 text-white" : "border border-neutral-300")}>
                    {on && <CheckCircle2 className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">{j.contactName || j.sellerName}</p>
                    <p className="truncate text-xs text-neutral-400">{j.code} · {j.location.address} · นัด {thaiDateShort(j.scheduledDate)}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={plan} disabled={selected.size === 0 || loading} className="btn-primary mt-3 w-full disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RouteIcon className="h-4 w-4" /> จัดเส้นทางที่ดีที่สุด ({selected.size})</>}
          </button>
        </div>

        {result && result.order.length > 0 && est && (
          <>
            <div className="mb-2 flex items-center justify-center">
              <span className={cn("chip", source === "google" ? "bg-blue-50 text-blue-700" : "bg-neutral-100 text-neutral-500")}>
                {source === "google" ? "🛣️ ระยะถนนจริง (Google)" : "📐 ระยะเส้นตรง (โดยประมาณ)"}
              </span>
            </div>
            <div className="card mb-4 grid grid-cols-3 divide-x divide-neutral-100">
              <Metric icon={<RouteIcon className="h-4 w-4" />} label="ระยะรวม" value={`${result.totalKm.toFixed(1)} กม.`} />
              <Metric icon={<Clock className="h-4 w-4" />} label={source === "google" ? "เวลาจริง" : "เวลาโดยประมาณ"} value={`${est.mins} นาที`} />
              <Metric icon={<Fuel className="h-4 w-4" />} label="ค่าน้ำมัน~" value={`฿${est.fuel}`} />
            </div>

            <a href={googleMapsDirUrl(base, result.order)} target="_blank" rel="noopener noreferrer" className="btn mb-4 w-full bg-blue-600 text-white">
              <Navigation className="h-4 w-4" /> เปิด Google Maps นำทางตามลำดับ
            </a>

            <div className="card">
              <p className="mb-3 text-sm font-bold text-neutral-800">ลำดับการเข้ารับ</p>
              <div className="relative">
                <div className="flex items-center gap-3 pb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-white"><Flag className="h-3.5 w-3.5" /></span>
                  <p className="text-sm font-medium text-neutral-600">เริ่มจากตำแหน่งฐาน</p>
                </div>
                {result.order.map((p, i) => {
                  const job = jobById(p.id);
                  return (
                    <div key={p.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="my-0.5 h-4 w-px bg-neutral-200" />
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                      </div>
                      <Link href={`/job/${p.id}`} className="flex flex-1 items-center gap-2 border-b border-neutral-50 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-800">{p.label}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-neutral-400">
                            <MapPin className="h-3 w-3" /> +{result.legs[i].toFixed(1)} กม. · {job?.code}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1 text-center">
      <span className="flex items-center gap-1 text-[11px] text-neutral-400">{icon}</span>
      <span className="text-base font-extrabold text-neutral-800">{value}</span>
      <span className="text-[10px] text-neutral-400">{label}</span>
    </div>
  );
}
