"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { buyersWithStats, commissionCollected, creditOf } from "@/lib/selectors";
import { Modal } from "@/components/ui";
import { MIN_CREDIT } from "@/lib/fees";
import { formatBaht, thaiDate, currentMonth } from "@/lib/utils";
import { Search, Ban, CheckCircle2, Phone, Coins, Plus, Minus, Wallet } from "lucide-react";
import type { User } from "@/lib/types";

export default function AdminBuyersPage() {
  const { db, setUserStatus, adjustCredit } = useStore();
  const [q, setQ] = useState("");
  const buyers = buyersWithStats(db).filter(
    (b) => b.user.name.includes(q) || b.user.phone.includes(q),
  );
  const comThisMonth = commissionCollected(db, currentMonth());
  const comAll = commissionCollected(db);

  const [editing, setEditing] = useState<User | null>(null);
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState("");

  const openAdjust = (u: User) => {
    setEditing(u);
    setDelta(0);
    setNote("");
  };
  const applyAdjust = () => {
    if (editing && delta !== 0) adjustCredit(editing.id, delta, note || undefined);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">จัดการผู้ซื้อ / คนขับ</h1>
          <p className="text-sm text-neutral-500">{buyers.length} ราย (พาร์ทเนอร์รับซื้อ)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input className="input !py-2 pl-9" placeholder="ค้นหาชื่อ/เบอร์" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {/* commission summary */}
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="card">
          <p className="flex items-center gap-1.5 text-xs text-neutral-400"><Wallet className="h-3.5 w-3.5" /> ค่าคอมเดือนนี้</p>
          <p className="text-2xl font-extrabold text-brand-700">฿{formatBaht(comThisMonth)}</p>
        </div>
        <div className="card">
          <p className="flex items-center gap-1.5 text-xs text-neutral-400"><Coins className="h-3.5 w-3.5" /> ค่าคอมสะสมทั้งหมด</p>
          <p className="text-2xl font-extrabold text-neutral-800">฿{formatBaht(comAll)}</p>
        </div>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs text-neutral-500">
              <th className="px-4 py-3 font-medium">ชื่อ</th>
              <th className="px-4 py-3 font-medium">เบอร์โทร</th>
              <th className="px-4 py-3 text-right font-medium">เครดิต</th>
              <th className="px-4 py-3 text-right font-medium">บิล</th>
              <th className="px-4 py-3 text-right font-medium">GMV</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 text-right font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map(({ user, gmv, bills }) => {
              const suspended = user.status === "suspended";
              const credit = creditOf(db, user.id);
              const low = credit < MIN_CREDIT;
              return (
                <tr key={user.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{user.name.charAt(0)}</span>
                      <span className="font-medium text-neutral-800">{user.name}</span>
                      {user.partner && <span className="chip bg-brand-100 text-brand-700">พาร์ทเนอร์</span>}
                      {user.lineConnected && <span className="chip bg-[#06C755]/10 text-[#06C755]">LINE</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user.phone}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${low ? "text-red-600" : "text-neutral-800"}`}>
                    ฿{formatBaht(credit)}
                    {low && <span className="ml-1 chip bg-red-100 text-red-600">ต่ำ</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600">{bills}</td>
                  <td className="px-4 py-3 text-right font-bold text-neutral-800">฿{formatBaht(gmv)}</td>
                  <td className="px-4 py-3">
                    {suspended ? (
                      <span className="chip bg-red-100 text-red-600">ระงับ</span>
                    ) : (
                      <span className="chip bg-brand-100 text-brand-700">ใช้งาน</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openAdjust(user)} className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-700">
                        <Coins className="h-3.5 w-3.5" /> เครดิต
                      </button>
                      {suspended ? (
                        <button onClick={() => setUserStatus(user.id, "active")} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> เปิดใช้
                        </button>
                      ) : (
                        <button onClick={() => setUserStatus(user.id, "suspended")} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600">
                          <Ban className="h-3.5 w-3.5" /> ระงับ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {buyers.length === 0 && <p className="py-10 text-center text-sm text-neutral-400">ไม่พบผู้ซื้อ</p>}
      </div>

      {/* adjust credit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`ปรับเครดิต — ${editing?.name ?? ""}`}
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setEditing(null)}>ยกเลิก</button>
            <button className="btn-primary flex-1" disabled={delta === 0} onClick={applyAdjust}>ยืนยัน</button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 text-sm">
              <span className="text-neutral-500">เครดิตปัจจุบัน</span>
              <span className="font-bold text-neutral-800">฿{formatBaht(creditOf(db, editing.id))}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[300, 500, 1000, 2000].map((v) => (
                <button key={v} onClick={() => setDelta(v)} className={`rounded-xl border-2 py-2 text-sm font-bold ${delta === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500"}`}>+{v}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDelta((d) => d - 100)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600"><Minus className="h-4 w-4" /></button>
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">฿</span>
                <input className="input pl-8 text-center text-lg font-bold" inputMode="numeric" value={String(delta)} onChange={(e) => setDelta(Number(e.target.value.replace(/[^\d-]/g, "")) || 0)} />
              </div>
              <button onClick={() => setDelta((d) => d + 100)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600"><Plus className="h-4 w-4" /></button>
            </div>
            <p className="text-center text-xs text-neutral-400">ใส่ค่าติดลบเพื่อหักเครดิต (เช่น -100)</p>
            <input className="input" placeholder="หมายเหตุ (เช่น ยืนยันโอนเติมเครดิต)" value={note} onChange={(e) => setNote(e.target.value)} />
            {delta !== 0 && (
              <div className="flex items-center justify-between rounded-xl bg-brand-50 p-3 text-sm ring-1 ring-brand-100">
                <span className="text-neutral-600">เครดิตหลังปรับ</span>
                <span className="font-extrabold text-brand-700">฿{formatBaht(creditOf(db, editing.id) + delta)}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
