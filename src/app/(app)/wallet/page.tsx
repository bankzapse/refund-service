"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { PromptPayQR } from "@/components/PromptPayQR";
import { creditOf, walletForBuyer, todayCommission } from "@/lib/selectors";
import {
  MIN_CREDIT,
  COMPANY_PROMPTPAY,
  COMPANY_NAME,
  TOPUP_PRESETS,
  feeRateLabel,
} from "@/lib/fees";
import { formatBaht, thaiDateTime } from "@/lib/utils";
import {
  Coins,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import type { WalletTxn } from "@/lib/types";

export default function WalletPage() {
  const { db, currentUser, topUpCredit } = useStore();
  const u = currentUser!;

  const credit = creditOf(db, u.id);
  const txns = walletForBuyer(db, u.id);
  const todayCom = todayCommission(db, u.id);
  const ready = credit >= MIN_CREDIT;

  const [amount, setAmount] = useState(500);
  const [showQR, setShowQR] = useState(false);

  const confirmTopUp = () => {
    if (amount <= 0) return;
    topUpCredit(amount);
    setShowQR(false);
  };

  return (
    <div className="pb-28">
      <AppHeader title="กระเป๋าเครดิต" subtitle="พาร์ทเนอร์รับซื้อ" back />

      <div className="space-y-4 px-5 py-4">
        {/* balance card */}
        <div
          className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-card ${
            ready ? "bg-gradient-to-br from-brand-600 to-brand-700" : "bg-gradient-to-br from-red-500 to-red-600"
          }`}
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <p className="flex items-center gap-1.5 text-sm text-white/80">
              <Coins className="h-4 w-4" /> เครดิตคงเหลือ
            </p>
            <p className="mt-1 text-4xl font-extrabold">฿{formatBaht(credit)}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              {ready ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> พร้อมรับงาน
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" /> เครดิตต่ำกว่า ฿{MIN_CREDIT} — รับงานไม่ได้
                </>
              )}
            </div>
          </div>
        </div>

        {/* min-credit hint */}
        <div className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3.5 text-xs text-brand-800 ring-1 ring-brand-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            ต้องมีเครดิต ≥ <b>฿{MIN_CREDIT}</b> ถึงจะรับงานได้ · ทุกครั้งที่ออกบิล ระบบจะหัก
            <b> ค่าคอม {feeRateLabel}</b> ของยอดรับซื้อจากเครดิต · ผู้ขายได้เงินเต็มจำนวน
          </p>
        </div>

        {/* today summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-neutral-400">ค่าคอมวันนี้</p>
            <p className="text-xl font-extrabold text-amber-600">฿{formatBaht(todayCom)}</p>
          </div>
          <div className="card">
            <p className="text-xs text-neutral-400">ธุรกรรมทั้งหมด</p>
            <p className="text-xl font-extrabold text-neutral-800">{txns.length} รายการ</p>
          </div>
        </div>

        {/* top-up */}
        <div className="card">
          <h2 className="mb-3 flex items-center gap-1.5 font-bold text-neutral-800">
            <Plus className="h-4 w-4 text-brand-600" /> เติมเครดิต
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {TOPUP_PRESETS.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setAmount(v);
                  setShowQR(false);
                }}
                className={`rounded-xl border-2 py-2 text-sm font-bold transition ${
                  amount === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500"
                }`}
              >
                {v.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative mt-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">฿</span>
            <input
              className="input pl-8 text-lg font-bold"
              inputMode="numeric"
              value={amount ? String(amount) : ""}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)}
              placeholder="ระบุจำนวน"
            />
          </div>

          {!showQR ? (
            <button className="btn-primary mt-3 w-full" disabled={amount <= 0} onClick={() => setShowQR(true)}>
              โอนผ่าน PromptPay ฿{formatBaht(amount)}
            </button>
          ) : (
            <div className="mt-3 flex flex-col items-center rounded-2xl bg-neutral-50 p-4">
              <p className="mb-1 text-sm font-semibold text-neutral-700">สแกนโอนเข้าบัญชี {COMPANY_NAME}</p>
              <p className="mb-3 text-xs text-neutral-400">พร้อมเพย์ {COMPANY_PROMPTPAY}</p>
              <PromptPayQR target={COMPANY_PROMPTPAY} amount={amount} size={170} />
              <p className="mt-3 text-center text-xs text-neutral-400">
                หลังโอนแล้วกดยืนยัน ระบบจะเพิ่มเครดิตให้ทันที
                <br />
                (production: ยืนยันอัตโนมัติเมื่อได้รับเงิน)
              </p>
              <button className="btn-primary mt-3 w-full" onClick={confirmTopUp}>
                ยืนยันโอนแล้ว +฿{formatBaht(amount)}
              </button>
              <button className="mt-2 text-xs text-neutral-400" onClick={() => setShowQR(false)}>
                ยกเลิก
              </button>
            </div>
          )}
        </div>

        {/* history */}
        <div className="card">
          <h2 className="mb-2 font-bold text-neutral-800">ประวัติธุรกรรม</h2>
          {txns.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">ยังไม่มีธุรกรรม</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {txns.map((t) => (
                <TxnRow key={t.id} t={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TYPE_META: Record<WalletTxn["type"], { label: string; icon: React.ElementType; tone: string }> = {
  topup: { label: "เติมเครดิต", icon: ArrowUpCircle, tone: "text-brand-600" },
  commission: { label: "ค่าคอมบริษัท", icon: ArrowDownCircle, tone: "text-amber-600" },
  adjust: { label: "ปรับโดยแอดมิน", icon: SlidersHorizontal, tone: "text-neutral-500" },
};

function TxnRow({ t }: { t: WalletTxn }) {
  const m = TYPE_META[t.type];
  const pos = t.amount >= 0;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 ${m.tone}`}>
        <m.icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-800">{t.note || m.label}</p>
        <p className="text-xs text-neutral-400">{thaiDateTime(t.date)}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${pos ? "text-brand-600" : "text-amber-600"}`}>
          {pos ? "+" : "−"}฿{formatBaht(Math.abs(t.amount))}
        </p>
        <p className="text-[11px] text-neutral-400">คงเหลือ ฿{formatBaht(t.balanceAfter)}</p>
      </div>
    </div>
  );
}
