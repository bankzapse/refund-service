import Link from "next/link";
import type { RewardDraw } from "@/lib/types";
import { thaiMonthLabel } from "@/lib/utils";
import { Trophy, ChevronRight, Ticket } from "lucide-react";

export function RewardTeaser({ draw, tickets }: { draw?: RewardDraw; tickets?: number }) {
  return (
    <Link
      href="/rewards"
      className="relative block overflow-hidden rounded-2xl bg-ink p-4 text-white shadow-gold transition active:scale-[0.99]"
    >
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gold/10 blur-xl" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light to-gold-dark text-ink">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-gold-light">ผลรางวัลประจำเดือน</p>
          <p className="truncate text-sm text-white/70">
            {draw ? `${draw.prizeName} · ลุ้นทุกสิ้นเดือน` : "ขายของเก่า ลุ้นรางวัลใหญ่"}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-gold/70" />
      </div>
      {tickets != null && (
        <div className="relative mt-3 flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs text-gold-light ring-1 ring-gold/20">
          <Ticket className="h-4 w-4" />
          คุณมี <span className="font-bold">{tickets}</span> สิทธิ์ลุ้นรางวัลเดือน{thaiMonthLabel(
            new Date().toISOString().slice(0, 7),
          )}
        </div>
      )}
    </Link>
  );
}
