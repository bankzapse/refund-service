"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ticketsForUser, currentDraw } from "@/lib/selectors";
import { formatBaht, thaiMonthLabel, thaiDate, currentMonth } from "@/lib/utils";
import { ArrowLeft, Trophy, Ticket, Sparkles, Crown } from "lucide-react";

export default function RewardsPage() {
  const router = useRouter();
  const { db, currentUser } = useStore();
  const u = currentUser!;

  const announced = db.draws
    .filter((d) => d.status === "announced")
    .sort((a, b) => b.month.localeCompare(a.month));
  const latest = announced[0];
  const current = currentDraw(db);
  const myTickets = ticketsForUser(db, u.id);
  const totalTicketsThisMonth = db.tickets.filter((t) => t.month === currentMonth()).length;

  return (
    <div className="min-h-dvh bg-ink text-white">
      {/* header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-white/10 bg-ink/90 px-4 backdrop-blur">
        <button onClick={() => router.back()} className="-ml-2 rounded-full p-2 text-white/70 hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-gold-light">ผลรางวัลประจำเดือน</h1>
      </header>

      <div className="space-y-5 px-5 py-5">
        {/* latest announced draw */}
        {latest && (
          <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-ink-soft to-ink p-6 text-center shadow-gold">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
            <div className="relative">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-dark text-ink shadow-lg">
                <Trophy className="h-9 w-9" />
              </div>
              <p className="text-sm font-medium text-gold-light">รางวัลประจำเดือน{thaiMonthLabel(latest.month)}</p>
              <p className="mt-1 text-2xl font-extrabold text-white">{latest.prizeName}</p>
              <p className="text-sm text-white/50">มูลค่า ฿{formatBaht(latest.prizeValue)}</p>

              {/* winning number */}
              <p className="mt-5 text-xs uppercase tracking-widest text-gold/70">เลขที่ออก</p>
              <div className="mt-2 flex justify-center gap-1.5">
                {latest.winningNumber.split("").map((d, i) => (
                  <span
                    key={i}
                    className="flex h-12 w-9 items-center justify-center rounded-lg border border-gold/40 bg-black/40 font-mono text-2xl font-bold text-gold-light"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {latest.winnerName && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 ring-1 ring-gold/30">
                  <Crown className="h-4 w-4 text-gold-light" />
                  <span className="text-sm font-semibold text-gold-light">ผู้ได้รับรางวัล: {latest.winnerName}</span>
                </div>
              )}
              {latest.announcedAt && <p className="mt-2 text-xs text-white/30">ประกาศเมื่อ {thaiDate(latest.announcedAt)}</p>}
            </div>
          </div>
        )}

        {/* current month status */}
        <div className="rounded-2xl border border-white/10 bg-ink-card p-5">
          <div className="flex items-center gap-2 text-gold-light">
            <Sparkles className="h-5 w-5" />
            <p className="font-bold">ลุ้นรางวัลเดือน{thaiMonthLabel(currentMonth())}</p>
          </div>
          <p className="mt-1 text-sm text-white/50">
            {current?.prizeName ?? "รางวัลใหญ่"} · ประกาศผลสิ้นเดือน · มีสิทธิ์ในระบบแล้ว {totalTicketsThisMonth} สิทธิ์
          </p>

          {u.role === "seller" && (
            <div className="mt-4 rounded-xl bg-gradient-to-br from-gold/20 to-transparent p-4 ring-1 ring-gold/20">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-gold-light"><Ticket className="h-4 w-4" /> สิทธิ์ของคุณ</span>
                <span className="text-3xl font-extrabold text-gold-light">{myTickets.length}</span>
              </div>
              {myTickets.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {myTickets.map((t) => (
                    <span key={t.id} className="rounded-md border border-gold/20 bg-black/30 px-2 py-1 font-mono text-xs font-semibold text-gold-light">
                      {t.number}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-white/40">ขายของเก่าให้สำเร็จเพื่อรับสิทธิ์ (100 บาท = 1 สิทธิ์)</p>
              )}
            </div>
          )}
        </div>

        {/* how it works */}
        <div className="rounded-2xl border border-white/10 bg-ink-card p-5">
          <p className="mb-3 font-bold text-white">กติกาการลุ้นรางวัล</p>
          <ol className="space-y-2.5 text-sm text-white/60">
            {[
              "ขายของเก่าผ่านแอปทุก 100 บาท รับ 1 สิทธิ์อัตโนมัติ",
              "สะสมสิทธิ์ตลอดเดือน ยิ่งขายมากยิ่งมีสิทธิ์มาก",
              "สิ้นเดือนระบบสุ่มเลขที่ออก และประกาศผู้ได้รับรางวัล",
              "รางวัลจะโอน/มอบให้ผู้โชคดีตามเงื่อนไข",
            ].map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[11px] font-bold text-gold-light">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>

        {/* past winners */}
        {announced.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-ink-card p-5">
            <p className="mb-3 font-bold text-white">ผู้โชคดีย้อนหลัง</p>
            <div className="divide-y divide-white/5">
              {announced.map((d) => (
                <div key={d.month} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold-light"><Trophy className="h-4 w-4" /></span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{d.winnerName}</p>
                    <p className="text-xs text-white/40">{thaiMonthLabel(d.month)} · {d.prizeName}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-gold-light">{d.winningNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="h-4" />
      </div>
    </div>
  );
}
