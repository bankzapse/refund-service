"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { currentDraw, ticketParticipants } from "@/lib/selectors";
import { formatBaht, thaiMonthLabel, thaiDate, currentMonth } from "@/lib/utils";
import { Trophy, Dice5, Save, Crown, ShieldCheck, Ticket } from "lucide-react";

export default function AdminRewardsPage() {
  const { db, setDrawPrize, drawWinner } = useStore();
  const month = currentMonth();
  const draw = currentDraw(db);
  const participants = ticketParticipants(db, month);
  const totalTickets = participants.reduce((s, p) => s + p.count, 0);
  const announced = draw?.status === "announced";
  const pastDraws = db.draws.filter((d) => d.status === "announced").sort((a, b) => b.month.localeCompare(a.month));

  const [prizeName, setPrizeName] = useState(draw?.prizeName ?? "ทองคำ 1 สลึง");
  const [prizeValue, setPrizeValue] = useState(String(draw?.prizeValue ?? 8000));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">จัดการรางวัล</h1>
        <p className="text-sm text-neutral-500">งวดเดือน{thaiMonthLabel(month)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* draw management */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-3 font-bold text-neutral-800">ตั้งรางวัลงวดนี้</h2>
            <div className="grid grid-cols-[1fr_140px] gap-2.5">
              <div>
                <label className="label">ชื่อรางวัล</label>
                <input className="input" value={prizeName} onChange={(e) => setPrizeName(e.target.value)} />
              </div>
              <div>
                <label className="label">มูลค่า (บาท)</label>
                <input className="input" inputMode="numeric" value={prizeValue} onChange={(e) => setPrizeValue(e.target.value.replace(/\D/g, ""))} />
              </div>
            </div>
            <button
              onClick={() => setDrawPrize(month, prizeName.trim() || "รางวัลประจำเดือน", Number(prizeValue) || 0)}
              className="btn-outline mt-3 w-full"
            >
              <Save className="h-4 w-4" /> บันทึกรางวัล
            </button>
          </div>

          {/* draw / result */}
          <div className="card bg-ink text-white">
            <div className="flex items-center gap-2 text-gold-light">
              <Trophy className="h-5 w-5" />
              <h2 className="font-bold">ออกรางวัล</h2>
            </div>
            <p className="mt-1 text-sm text-white/60">มีสิทธิ์ในระบบ {totalTickets} สิทธิ์ · จากผู้ขาย {participants.length} ราย</p>

            {announced ? (
              <div className="mt-4 rounded-xl bg-white/5 p-4 ring-1 ring-gold/20">
                <p className="text-xs uppercase tracking-widest text-gold/70">เลขที่ออก</p>
                <div className="mt-1.5 flex gap-1.5">
                  {draw!.winningNumber.split("").map((d, i) => (
                    <span key={i} className="flex h-11 w-8 items-center justify-center rounded-lg border border-gold/40 bg-black/40 font-mono text-xl font-bold text-gold-light">{d}</span>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-gold-light">
                  <Crown className="h-4 w-4" /> ผู้โชคดี: <span className="font-bold">{draw!.winnerName}</span>
                </p>
                <p className="mt-1 text-xs text-white/40">ประกาศแล้ว · แจ้ง LINE ผู้ขายทุกคน</p>
              </div>
            ) : (
              <button onClick={() => drawWinner(month)} disabled={totalTickets === 0} className="btn mt-4 w-full bg-gradient-to-r from-gold-light to-gold-dark text-ink disabled:opacity-40">
                <Dice5 className="h-5 w-5" /> สุ่มผู้โชคดี & ประกาศผล
              </button>
            )}

            <p className="mt-3 flex items-start gap-1.5 text-xs text-white/40">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              เดโม: สุ่มจากสิทธิ์ทั้งหมดอย่างยุติธรรม · production ผูกกับหวยรัฐบาล/commit-reveal เพื่อพิสูจน์ได้
            </p>
          </div>

          {/* past */}
          {pastDraws.length > 0 && (
            <div className="card">
              <h2 className="mb-3 font-bold text-neutral-800">ประวัติการออกรางวัล</h2>
              <div className="divide-y divide-neutral-100">
                {pastDraws.map((d) => (
                  <div key={d.month} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold-dark"><Trophy className="h-4 w-4" /></span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800">{d.winnerName}</p>
                      <p className="text-xs text-neutral-400">{thaiMonthLabel(d.month)} · {d.prizeName}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-neutral-600">{d.winningNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* participants */}
        <div className="card h-fit">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-neutral-800">ผู้มีสิทธิ์</h2>
            <span className="chip bg-gold/15 text-gold-dark"><Ticket className="h-3.5 w-3.5" /> {totalTickets}</span>
          </div>
          {participants.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">ยังไม่มีผู้มีสิทธิ์</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {participants.map((p) => (
                <div key={p.userId} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-neutral-700">{p.name}</span>
                  <span className="text-sm font-bold text-neutral-800">{p.count} สิทธิ์</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
