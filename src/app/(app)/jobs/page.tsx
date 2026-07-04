"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { JobCard } from "@/components/JobCard";
import { Segmented, EmptyState } from "@/components/ui";
import { jobsForSeller, jobsForBuyer, availableJobsNear, activeJobs, doneJobs } from "@/lib/selectors";
import { RADIUS_KM, DEFAULT_BASE } from "@/lib/geo";
import { Navigation, Route as RouteIcon } from "lucide-react";

export default function JobsPage() {
  const { db, currentUser } = useStore();
  const u = currentUser!;
  if (u.role === "seller") return <SellerJobs userId={u.id} db={db} />;
  return <BuyerJobs />;
}

function SellerJobs({ userId, db }: { userId: string; db: ReturnType<typeof useStore>["db"] }) {
  const [tab, setTab] = useState<"active" | "history">("active");
  const jobs = jobsForSeller(db, userId);
  const list = tab === "active" ? activeJobs(jobs) : doneJobs(jobs);
  return (
    <div>
      <AppHeader title="รายการของฉัน" subtitle={`ทั้งหมด ${jobs.length} รายการ`} />
      <div className="px-5 pb-28 pt-4">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: "กำลังดำเนินการ" },
            { value: "history", label: "ประวัติ" },
          ]}
        />
        <div className="mt-4 space-y-3">
          {list.length === 0 ? (
            <EmptyState icon="🧾" title={tab === "active" ? "ยังไม่มีงานที่กำลังดำเนินการ" : "ยังไม่มีประวัติ"} hint="กดปุ่ม + เพื่อสร้างรายการขายของเก่า" />
          ) : (
            list.map((j) => <JobCard key={j.id} job={j} perspective="seller" />)
          )}
        </div>
      </div>
    </div>
  );
}

function BuyerJobs() {
  const { db, currentUser, setBaseLocation, pushToast } = useStore();
  const u = currentUser!;
  const [tab, setTab] = useState<"open" | "mine" | "history">("open");

  const base = { lat: u.baseLat ?? DEFAULT_BASE.lat, lng: u.baseLng ?? DEFAULT_BASE.lng };
  const near = availableJobsNear(db, base.lat, base.lng, RADIUS_KM);
  const mine = jobsForBuyer(db, u.id);

  const updateLocation = () => {
    if (!navigator.geolocation) return setBaseLocation(DEFAULT_BASE.lat, DEFAULT_BASE.lng);
    navigator.geolocation.getCurrentPosition(
      (p) => setBaseLocation(p.coords.latitude, p.coords.longitude),
      () => pushToast("ระบุตำแหน่งไม่สำเร็จ", "info"),
    );
  };

  return (
    <div>
      <AppHeader
        title="งานของฉัน"
        subtitle={`${near.length} งานในรัศมี ${RADIUS_KM} กม. · ${activeJobs(mine).length} กำลังทำ`}
        right={
          <Link href="/route" className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white">
            <RouteIcon className="h-4 w-4" /> จัดเส้นทาง
          </Link>
        }
      />
      <div className="px-5 pb-28 pt-4">
        <button
          onClick={updateLocation}
          className="mb-3 flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm transition active:scale-[0.99]"
        >
          <Navigation className="h-4 w-4 text-brand-600" />
          <span className="flex-1 text-left text-neutral-600">
            {u.baseLat ? "ตำแหน่งฐานของคุณ" : "ยังไม่ได้ตั้งตำแหน่ง (ใช้กลางกรุงเทพฯ)"}
          </span>
          <span className="text-xs font-semibold text-brand-600">อัปเดตตำแหน่ง</span>
        </button>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "open", label: `ใกล้ฉัน (${near.length})` },
            { value: "mine", label: "กำลังทำ" },
            { value: "history", label: "ประวัติ" },
          ]}
        />

        <div className="mt-4 space-y-3">
          {tab === "open" ? (
            near.length === 0 ? (
              <EmptyState icon="📭" title={`ไม่มีงานเปิดในรัศมี ${RADIUS_KM} กม.`} hint="ลองอัปเดตตำแหน่ง หรือรอผู้ขายลงงานใหม่" />
            ) : (
              near.map((j) => <JobCard key={j.id} job={j} perspective="buyer" distanceKm={j.distanceKm} />)
            )
          ) : (
            <BuyerHistory jobs={tab === "mine" ? activeJobs(mine) : doneJobs(mine)} tab={tab} />
          )}
        </div>
      </div>
    </div>
  );
}

function BuyerHistory({ jobs, tab }: { jobs: ReturnType<typeof jobsForBuyer>; tab: "mine" | "history" }) {
  if (jobs.length === 0) {
    return <EmptyState icon="🚚" title={tab === "mine" ? "ยังไม่มีงานที่กำลังทำ" : "ยังไม่มีประวัติ"} />;
  }
  return (
    <>
      {jobs.map((j) => (
        <JobCard key={j.id} job={j} perspective="buyer" />
      ))}
    </>
  );
}
