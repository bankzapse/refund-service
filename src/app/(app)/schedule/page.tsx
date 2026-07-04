"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { Sheet, EmptyState } from "@/components/ui";
import { slotsForBuyer } from "@/lib/selectors";
import { thaiWeekday, thaiDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Users, MapPin, CalendarClock, CheckCircle2 } from "lucide-react";

const AREA_OPTIONS = ["จตุจักร / ลาดพร้าว", "พญาไท / อารีย์", "ดินแดง / ห้วยขวาง", "บางกะปิ / รามคำแหง", "อื่น ๆ"];

export default function SchedulePage() {
  const { db, currentUser, addSlot, removeSlot } = useStore();
  const u = currentUser!;
  const [open, setOpen] = useState(false);

  const [date, setDate] = useState("");
  const [area, setArea] = useState(AREA_OPTIONS[0]);
  const [capacity, setCapacity] = useState(5);
  const [err, setErr] = useState("");

  const slots = useMemo(() => slotsForBuyer(db, u.id), [db, u.id]);
  const grouped = useMemo(() => {
    const m = new Map<string, typeof slots>();
    slots.forEach((s) => m.set(s.date, [...(m.get(s.date) || []), s]));
    return [...m.entries()];
  }, [slots]);

  const totalBooked = slots.reduce((s, x) => s + x.booked, 0);

  const submit = () => {
    setErr("");
    if (!date) return setErr("กรุณาเลือกวันที่");
    addSlot({ date, area, capacity });
    setOpen(false);
    setDate("");
  };

  return (
    <div>
      <AppHeader
        title="ตารางรับของ"
        subtitle={`${slots.length} รอบ · มีจองแล้ว ${totalBooked} คิว`}
        right={
          <button onClick={() => setOpen(true)} className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> เพิ่มรอบ
          </button>
        }
      />

      <div className="px-5 pb-28 pt-4">
        {/* explainer */}
        <div className="mb-4 rounded-2xl bg-blue-50 p-3.5 text-sm text-blue-800 ring-1 ring-blue-100">
          <p className="font-semibold">เปิดรอบให้ผู้ขายจองเข้ามา</p>
          <p className="mt-0.5 text-xs text-blue-600">กำหนดวัน-เวลา-โซน และจำนวนคิวที่รับได้ ผู้ขายจะเลือกจองรอบของคุณตอนสร้างงาน</p>
        </div>

        {grouped.length === 0 ? (
          <EmptyState icon="🗓️" title="ยังไม่มีรอบเข้ารับ" hint="กด “เพิ่มรอบ” เพื่อเปิดตารางให้ผู้ขายจอง" />
        ) : (
          <div className="space-y-4">
            {grouped.map(([d, daySlots]) => (
              <div key={d}>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-neutral-700">
                  <CalendarClock className="h-4 w-4 text-brand-600" />
                  {thaiWeekday(d)} · {thaiDateShort(d)}
                </p>
                <div className="space-y-2">
                  {daySlots.map((s) => {
                    const full = s.booked >= s.capacity;
                    return (
                      <div key={s.id} className="card flex items-center gap-3 !p-3.5">
                        <div className="flex-1">
                          <p className="flex items-center gap-1 text-sm font-semibold text-neutral-800">
                            <MapPin className="h-3.5 w-3.5 text-brand-600" /> {s.area}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-400">รับทั้งวัน</p>
                        </div>
                        <div className="text-right">
                          <span className={cn("chip", full ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-700")}>
                            <Users className="h-3.5 w-3.5" /> {s.booked}/{s.capacity} คิว
                          </span>
                        </div>
                        <button
                          onClick={() => removeSlot(s.id)}
                          disabled={s.booked > 0}
                          className="rounded-lg p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                          title={s.booked > 0 ? "มีคนจองแล้ว ลบไม่ได้" : "ลบรอบ"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="เพิ่มรอบเข้ารับ">
        <div className="space-y-3">
          <div>
            <label className="label">วันที่</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">โซนพื้นที่</label>
            <select className="input" value={area} onChange={(e) => setArea(e.target.value)}>
              {AREA_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">รับได้กี่คิว</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={15} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="flex-1 accent-brand-600" />
              <span className="w-10 text-center text-lg font-bold text-brand-700">{capacity}</span>
            </div>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button className="btn-primary w-full" onClick={submit}>
            <CheckCircle2 className="h-4 w-4" /> เปิดรอบนี้
          </button>
        </div>
      </Sheet>
    </div>
  );
}
