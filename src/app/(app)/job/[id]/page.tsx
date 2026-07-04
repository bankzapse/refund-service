"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge, Stepper, Modal } from "@/components/ui";
import { STATUS_META } from "@/lib/types";
import { MATERIAL_MAP } from "@/lib/materials";
import { formatBaht, thaiDate, thaiDateTime } from "@/lib/utils";
import { computeSettlement, feeRateLabel, MIN_CREDIT } from "@/lib/fees";
import { jobValueForBuyer, buyerPrice } from "@/lib/selectors";
import { PromptPayQR } from "@/components/PromptPayQR";
import { MapPin, Phone, CalendarClock, User, StickyNote, Ticket, MessageCircle, Truck, Check, Wallet } from "lucide-react";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { db, currentUser, claimJob, confirmJob, setStatus, createBill, cancelJob } = useStore();
  const u = currentUser!;
  const job = db.jobs.find((j) => j.id === id);

  const [showComplete, setShowComplete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [amount, setAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "promptpay">("cash");

  if (!job) {
    return (
      <div>
        <AppHeader title="ไม่พบงาน" back />
        <p className="p-8 text-center text-neutral-400">ไม่พบรายการนี้</p>
      </div>
    );
  }

  const isOwner = job.sellerId === u.id;
  const isMine = job.buyerId === u.id;
  const isBuyer = u.role === "buyer";
  const isOpen = job.status === "submitted" && !job.buyerId;
  const settle = job.finalAmount != null ? computeSettlement(job.finalAmount) : null;
  const buyerValue = isBuyer ? jobValueForBuyer(db, u.id, job) : null;

  const openComplete = () => {
    setAmount(String(buyerValue ?? job.estimatedTotal));
    setShowComplete(true);
  };

  // ปิดงาน = ออกบิลอัตโนมัติ (เชื่อมไปยังระบบร้าน B + GMV แอดมิน C + สิทธิ์ผู้ขาย)
  const finishWithBill = async () => {
    const amt = Number(amount) || 0;
    const priced = job.items.map((it) => {
      const price = buyerPrice(db, u.id, it.materialId);
      return { materialId: it.materialId, name: it.name, unit: it.unit, qty: it.qty, pricePerUnit: price, subtotal: it.qty * price };
    });
    const sum = priced.reduce((s, i) => s + i.subtotal, 0);
    const items =
      priced.length > 0 && sum === amt
        ? priced
        : [{ materialId: "mixed", name: "ของเก่า (เหมารวม)", unit: "เหมา", qty: 1, pricePerUnit: amt, subtotal: amt }];
    await createBill({
      source: "app_job",
      jobId: job.id,
      sellerName: job.contactName || job.sellerName,
      sellerPhone: job.contactPhone,
      items,
      paymentMethod: payMethod,
    });
    setShowComplete(false);
  };

  return (
    <div>
      <AppHeader title={job.code} subtitle={STATUS_META[job.status].label} back />

      <div className="space-y-4 px-5 py-4">
        {/* stepper */}
        {job.status !== "cancelled" ? (
          <div className="card">
            <Stepper status={job.status} />
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-100 p-4 text-center text-sm text-neutral-500">งานนี้ถูกยกเลิกแล้ว</div>
        )}

        {/* items */}
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold text-neutral-800">รายการของเก่า</h2>
            <StatusBadge status={job.status} />
          </div>
          <div className="divide-y divide-neutral-100">
            {job.items.map((it) => (
              <div key={it.materialId} className="flex items-center gap-3 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-base">
                  {MATERIAL_MAP[it.materialId]?.emoji ?? "♻️"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">{it.name}</p>
                  <p className="text-xs text-neutral-400">{it.qty} {it.unit} × ฿{formatBaht(it.pricePerUnit)}</p>
                </div>
                <span className="text-sm font-semibold text-neutral-700">฿{formatBaht(it.qty * it.pricePerUnit)}</span>
              </div>
            ))}
          </div>
          {settle ? (
            <div className="mt-2 space-y-1.5 border-t border-neutral-100 pt-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">ราคาของที่รับซื้อ</span>
                <span className="font-medium text-neutral-700">฿{formatBaht(settle.goods)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                <span className="text-sm font-medium text-neutral-700">ผู้ขายได้รับเต็มจำนวน</span>
                <span className="text-xl font-extrabold text-brand-700">฿{formatBaht(settle.sellerNet)}</span>
              </div>
              {isBuyer && (
                <div className="flex items-center justify-between text-xs text-amber-600">
                  <span>ค่าคอมบริษัท ({feeRateLabel}) · หักจากเครดิตคุณ</span>
                  <span className="font-medium">−฿{formatBaht(settle.fee)}</span>
                </div>
              )}
            </div>
          ) : job.items.length > 0 ? (
            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2.5">
              <span className="text-sm text-neutral-500">{isBuyer ? "มูลค่าตามราคาของคุณ" : "ประเมินราคา"}</span>
              <span className="text-xl font-extrabold text-brand-700">
                ฿{formatBaht(isBuyer && buyerValue != null ? buyerValue : job.estimatedTotal)}
              </span>
            </div>
          ) : (
            <p className="mt-2 border-t border-neutral-100 pt-2.5 text-sm text-neutral-400">
              ยังไม่ได้ระบุรายการ — ตกลงราคากันหน้างานตอนเข้ารับ
            </p>
          )}
          {settle && settle.tickets > 0 && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-2 text-xs font-medium text-gold-dark">
              <Ticket className="h-4 w-4" /> ผู้ขายได้รับ {settle.tickets} สิทธิ์ลุ้นรางวัลจากงานนี้
            </div>
          )}
        </div>

        {/* details */}
        <div className="card space-y-3">
          <Row icon={<CalendarClock className="h-4 w-4" />} label="วันนัดรับ" value={`${thaiDate(job.scheduledDate)} (ทั้งวัน)`} />
          <Row icon={<MapPin className="h-4 w-4" />} label="สถานที่" value={`${job.location.address}${job.houseNo ? ` เลขที่ ${job.houseNo}` : ""}`} sub={job.landmark && job.landmark !== "-" ? `จุดสังเกต: ${job.landmark}` : undefined} />
          <Row icon={<User className="h-4 w-4" />} label="ผู้ติดต่อ" value={job.contactName} action={<a href={`tel:${job.contactPhone}`} className="flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"><Phone className="h-3.5 w-3.5" />{job.contactPhone}</a>} />
          <Row icon={<Truck className="h-4 w-4" />} label={isBuyer ? "ผู้ขาย" : "ผู้ซื้อ"} value={isBuyer ? job.sellerName : job.buyerName ?? "รอผู้ซื้อรับงาน"} />
          {job.note && <Row icon={<StickyNote className="h-4 w-4" />} label="หมายเหตุ" value={job.note} />}
        </div>

        {/* timeline */}
        <div className="card">
          <h2 className="mb-3 font-bold text-neutral-800">ไทม์ไลน์สถานะ</h2>
          <div className="space-y-0">
            {[...job.history].reverse().map((h, i, arr) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${STATUS_META[h.status].dot}`} />
                  {i < arr.length - 1 && <span className="w-px flex-1 bg-neutral-200" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-neutral-800">{STATUS_META[h.status].label}</p>
                  <p className="text-xs text-neutral-400">{thaiDateTime(h.at)}</p>
                  {h.note && <p className="mt-0.5 text-xs text-neutral-500">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {job.buyerName && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
            <MessageCircle className="h-3.5 w-3.5 text-[#06C755]" /> อัปเดตสถานะจะถูกส่งแจ้งเตือนผ่าน LINE ให้ผู้ขาย
          </p>
        )}
      </div>

      {/* action bar */}
      <ActionBar
        isOpen={isOpen}
        isOwner={isOwner}
        isMine={isMine}
        isBuyer={isBuyer}
        canAccept={(u.credit ?? 0) >= MIN_CREDIT}
        credit={u.credit ?? 0}
        status={job.status}
        onClaim={() => claimJob(job.id)}
        onConfirm={() => confirmJob(job.id, "คอนเฟิร์มงาน เจอกันตามนัด")}
        onEnRoute={() => setStatus(job.id, "en_route", "กำลังเดินทางไปรับ")}
        onComplete={openComplete}
        onCancel={() => setShowCancel(true)}
      />

      {/* complete modal */}
      <Modal
        open={showComplete}
        onClose={() => setShowComplete(false)}
        title="ปิดงาน & บันทึกยอดจริง"
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setShowComplete(false)}>ยกเลิก</button>
            <button className="btn-primary flex-1" onClick={finishWithBill}>
              ยืนยันปิดงาน & ออกบิล
            </button>
          </>
        }
      >
        <p className="mb-2">กรอกราคาของที่รับซื้อจริง (หลังชั่ง)</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">฿</span>
          <input className="input pl-8 text-lg font-bold" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
        </div>
        {(() => {
          const s = computeSettlement(Number(amount) || 0);
          return (
            <div className="mt-3 space-y-1.5 rounded-xl bg-neutral-50 p-3">
              <div className="flex justify-between border-b border-neutral-200 pb-1.5">
                <span className="text-sm font-semibold text-neutral-700">ต้องจ่ายผู้ขาย (เต็มจำนวน)</span>
                <span className="text-lg font-extrabold text-brand-700">฿{formatBaht(s.sellerNet)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">ค่าคอมบริษัท ({feeRateLabel}) · หักจากเครดิตคุณ</span>
                <span className="font-medium text-amber-600">−฿{formatBaht(s.fee)}</span>
              </div>
              <p className="flex items-center gap-1 pt-0.5 text-xs text-gold-dark">
                <Ticket className="h-3.5 w-3.5" /> ผู้ขายได้รับ {s.tickets} สิทธิ์ลุ้นรางวัล
              </p>
            </div>
          );
        })()}
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-neutral-500">วิธีจ่ายผู้ขาย</p>
          <div className="grid grid-cols-2 gap-2">
            {(["cash", "promptpay"] as const).map((pm) => (
              <button
                key={pm}
                onClick={() => setPayMethod(pm)}
                className={`rounded-xl border-2 py-2 text-sm font-semibold ${payMethod === pm ? "border-brand-500 bg-brand-50 text-brand-700" : "border-neutral-200 text-neutral-500"}`}
              >
                {pm === "cash" ? "เงินสด" : "PromptPay"}
              </button>
            ))}
          </div>
          {payMethod === "promptpay" && job.contactPhone && (Number(amount) || 0) > 0 && (
            <div className="mt-3 flex flex-col items-center">
              <PromptPayQR target={job.contactPhone} amount={computeSettlement(Number(amount) || 0).sellerNet} size={150} />
              <p className="mt-1 text-xs text-neutral-400">ให้ผู้ขายสแกนรับเงิน</p>
            </div>
          )}
        </div>
      </Modal>

      {/* cancel modal */}
      <Modal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        title="ยกเลิกงานนี้?"
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setShowCancel(false)}>ไม่ยกเลิก</button>
            <button
              className="btn flex-1 bg-red-500 text-white"
              onClick={() => {
                cancelJob(job.id);
                setShowCancel(false);
              }}
            >
              ยืนยันยกเลิก
            </button>
          </>
        }
      >
        การยกเลิกจะแจ้งเตือนอีกฝ่ายทันที และไม่สามารถย้อนกลับได้
      </Modal>
    </div>
  );
}

function Row({ icon, label, value, sub, action }: { icon: React.ReactNode; label: string; value: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm font-medium text-neutral-800">{value}</p>
        {sub && <p className="text-xs text-neutral-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function ActionBar({
  isOpen,
  isOwner,
  isMine,
  isBuyer,
  canAccept,
  credit,
  status,
  onClaim,
  onConfirm,
  onEnRoute,
  onComplete,
  onCancel,
}: {
  isOpen: boolean;
  isOwner: boolean;
  isMine: boolean;
  isBuyer: boolean;
  canAccept: boolean;
  credit: number;
  status: string;
  onClaim: () => void;
  onConfirm: () => void;
  onEnRoute: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  // เครดิตไม่พอ → บล็อกรับงาน + ชวนเติมเครดิต
  if (isOpen && !isOwner && isBuyer && !canAccept) {
    return (
      <div className="sticky bottom-0 z-30 space-y-2 border-t border-neutral-100 bg-white/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-100">
          <Wallet className="h-4 w-4 shrink-0" />
          เครดิตของคุณ ฿{formatBaht(credit)} — ต้องมี ≥ ฿{MIN_CREDIT} ถึงจะรับงานได้
        </div>
        <Link href="/wallet" className="btn-primary w-full"><Wallet className="h-4 w-4" /> เติมเครดิต</Link>
      </div>
    );
  }

  const buttons: React.ReactNode[] = [];

  if (isOpen && !isOwner) {
    buttons.push(<button key="claim" className="btn-primary flex-1" onClick={onClaim}><Check className="h-4 w-4" /> รับงานนี้</button>);
  }
  if (isMine && status === "submitted") {
    buttons.push(<button key="cancel" className="btn-outline" onClick={onCancel}>ปฏิเสธ</button>);
    buttons.push(<button key="confirm" className="btn-primary flex-1" onClick={onConfirm}>คอนเฟิร์มงาน</button>);
  }
  if (isMine && status === "confirmed") {
    buttons.push(<button key="cancel" className="btn-outline" onClick={onCancel}>ยกเลิก</button>);
    buttons.push(<button key="enroute" className="btn-primary flex-1" onClick={onEnRoute}><Truck className="h-4 w-4" /> เริ่มเดินทางไปรับ</button>);
  }
  if (isMine && status === "en_route") {
    buttons.push(<button key="complete" className="btn-primary flex-1" onClick={onComplete}><Check className="h-4 w-4" /> ปิดงาน & บันทึกยอด</button>);
  }
  if (isOwner && (status === "submitted" || status === "confirmed")) {
    buttons.push(<button key="cancel" className="btn-outline flex-1 text-red-500" onClick={onCancel}>ยกเลิกงาน</button>);
  }

  if (buttons.length === 0) return <div className="h-2" />;

  return (
    <div className="sticky bottom-0 z-30 flex gap-3 border-t border-neutral-100 bg-white/95 px-5 py-3 backdrop-blur">
      {buttons}
    </div>
  );
}
