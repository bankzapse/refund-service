import type { DB } from "@/lib/seed";
import { monthlyRewards, BONUS_TIERS } from "@/lib/rewards";
import { formatBaht, thaiMonthLabel } from "@/lib/utils";
import { Target, TrendingUp, CheckCircle2, Gift, Sparkles } from "lucide-react";

/**
 * การ์ด "ภารกิจ & โบนัส" ประจำเดือน (ในหน้าคะแนน) — รางวัลแบบได้แน่นอน ไม่เสี่ยงโชค
 * แสดงความคืบหน้าจริงจากถุงที่หย่อน + โบนัสที่จะได้
 */
export function MonthlyRewards({ db, userId }: { db: DB; userId: string }) {
  const r = monthlyRewards(db, userId);
  const pct = (cur: number, target: number) => Math.min(100, Math.round((cur / target) * 100));

  return (
    <div className="card space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 font-bold text-neutral-800">
            <Sparkles className="h-4 w-4 text-gold-dark" /> ภารกิจ & โบนัส
          </h2>
          <p className="text-xs text-neutral-400">{thaiMonthLabel(r.month)} · ทำครบได้แต้มแน่นอน</p>
        </div>
        {r.totalBonusPoints > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold-dark">
            <Gift className="h-4 w-4" /> +{formatBaht(r.totalBonusPoints)} แต้ม
          </span>
        )}
      </div>

      {/* โบนัสขั้นบันได */}
      <div className="rounded-2xl bg-brand-50 p-3 ring-1 ring-brand-100">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-800">
            <TrendingUp className="h-4 w-4" /> โบนัสขั้นบันได
          </span>
          <span className="text-xs font-bold text-brand-700">
            หย่อนแล้ว {r.bagsThisMonth} ถุง · โบนัส +{Math.round(r.tier.pct * 100)}%
          </span>
        </div>
        {/* ladder */}
        <div className="flex gap-1.5">
          {BONUS_TIERS.map((t) => {
            const reached = r.bagsThisMonth >= t.minBags;
            return (
              <div key={t.minBags} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full ${reached ? "bg-brand-500" : "bg-brand-200/60"}`} />
                <p className={`mt-1 text-[10px] font-semibold ${reached ? "text-brand-700" : "text-neutral-400"}`}>{t.minBags}+ ถุง</p>
                <p className={`text-[10px] ${reached ? "text-brand-600" : "text-neutral-300"}`}>+{Math.round(t.pct * 100)}%</p>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-brand-700/80">
          {r.nextTier
            ? `อีก ${r.nextTier.minBags - r.bagsThisMonth} ถุง → โบนัสขึ้นเป็น +${Math.round(r.nextTier.pct * 100)}% ของแต้มเดือนนี้`
            : "🎉 ถึงขั้นสูงสุดแล้ว — โบนัสเต็มที่!"}
          {r.tierBonusPoints > 0 && ` · เดือนนี้ได้โบนัสขั้นบันได +${formatBaht(r.tierBonusPoints)} แต้ม`}
        </p>
      </div>

      {/* ภารกิจ */}
      <div className="space-y-2.5">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
          <Target className="h-4 w-4 text-brand-600" /> ภารกิจเดือนนี้
        </span>
        {r.missions.map(({ m, current, done }) => (
          <div key={m.key} className={`rounded-xl p-2.5 ring-1 ${done ? "bg-brand-50 ring-brand-100" : "bg-neutral-50 ring-neutral-100"}`}>
            <div className="flex items-center gap-2">
              {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" /> : <span className="h-4 w-4 shrink-0 rounded-full border-2 border-neutral-300" />}
              <p className={`flex-1 text-sm font-semibold ${done ? "text-brand-800" : "text-neutral-800"}`}>{m.label}</p>
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold ${done ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-neutral-500"}`}>+{m.reward} แต้ม</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 pl-6">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                <div className={`h-full rounded-full ${done ? "bg-brand-500" : "bg-brand-400"}`} style={{ width: `${pct(current, m.target)}%` }} />
              </div>
              <span className="shrink-0 text-[11px] font-medium text-neutral-400">
                {Math.min(current, m.target)}/{m.target} {m.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-neutral-400">
        โบนัสเป็นรางวัลตามผลงาน (ไม่ใช่การสุ่ม) · แต้มโบนัสเข้าบัญชีเมื่อสรุปสิ้นเดือน
      </p>
    </div>
  );
}
