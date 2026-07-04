"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MATERIAL_MAP } from "@/lib/materials";
import { feeRateLabel } from "@/lib/fees";
import { formatBaht, thaiDateTime } from "@/lib/utils";
import { PromptPayQR } from "@/components/PromptPayQR";
import { Printer, Ban, ArrowLeft, Recycle } from "lucide-react";

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { db, currentUser, voidBill } = useStore();
  const bill = db.bills.find((b) => b.id === id);

  if (!bill) {
    return (
      <div className="card py-16 text-center text-neutral-400">
        ไม่พบบิลนี้ · <button onClick={() => router.push("/shop/bills")} className="text-brand-600">กลับ</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* actions */}
      <div className="no-print mb-4 flex items-center justify-between">
        <button onClick={() => router.push("/shop/bills")} className="btn-ghost !px-2 text-sm text-neutral-500">
          <ArrowLeft className="h-4 w-4" /> รายการบิล
        </button>
        <div className="flex gap-2">
          {bill.status === "paid" && (
            <button onClick={() => voidBill(bill.id)} className="btn-outline !px-3 !py-2 text-sm text-red-500">
              <Ban className="h-4 w-4" /> ยกเลิกบิล
            </button>
          )}
          <button onClick={() => window.print()} className="btn-primary !px-4 !py-2 text-sm">
            <Printer className="h-4 w-4" /> พิมพ์บิล
          </button>
        </div>
      </div>

      {/* bill */}
      <div className="print-area card relative overflow-hidden">
        {bill.status === "void" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rotate-[-20deg] text-6xl font-extrabold text-red-500/15">ยกเลิก</span>
          </div>
        )}

        <div className="flex items-start justify-between border-b border-dashed border-neutral-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Recycle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-neutral-800">{currentUser!.name}</p>
              <p className="text-xs text-neutral-400">ร้านรับซื้อของเก่า · Recycle Fund</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold text-neutral-800">{bill.code}</p>
            <p className="text-xs text-neutral-400">{thaiDateTime(bill.date)}</p>
          </div>
        </div>

        <div className="flex justify-between py-3 text-sm">
          <div>
            <p className="text-xs text-neutral-400">ผู้ขาย</p>
            <p className="font-medium text-neutral-800">{bill.sellerName}</p>
            {bill.sellerPhone && <p className="text-xs text-neutral-500">{bill.sellerPhone}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-400">ชำระโดย</p>
            <p className="font-medium text-neutral-800">{bill.paymentMethod === "cash" ? "เงินสด" : bill.paymentMethod === "transfer" ? "โอนเงิน" : "PromptPay"}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-neutral-100 text-left text-xs text-neutral-400">
              <th className="py-2 font-medium">รายการ</th>
              <th className="py-2 text-right font-medium">จำนวน</th>
              <th className="py-2 text-right font-medium">ราคา/หน่วย</th>
              <th className="py-2 text-right font-medium">รวม</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((it, i) => (
              <tr key={i} className="border-b border-neutral-50">
                <td className="py-2 text-neutral-800">
                  {MATERIAL_MAP[it.materialId]?.emoji} {it.name}
                </td>
                <td className="py-2 text-right text-neutral-600">{it.qty} {it.unit}</td>
                <td className="py-2 text-right text-neutral-600">฿{formatBaht(it.pricePerUnit)}</td>
                <td className="py-2 text-right font-medium text-neutral-800">฿{formatBaht(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-3 max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">ยอดรับซื้อ</span>
            <span className="font-medium text-neutral-800">฿{formatBaht(bill.goodsTotal)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2">
            <span className="font-bold text-neutral-800">จ่ายผู้ขาย (เต็มจำนวน)</span>
            <span className="text-xl font-extrabold text-brand-700">฿{formatBaht(bill.netPaid)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-neutral-400">ค่าคอมบริษัท ({feeRateLabel}) · หักจากเครดิตร้าน</span>
            <span className="text-amber-600">−฿{formatBaht(bill.fee)}</span>
          </div>
        </div>

        {bill.paymentMethod === "promptpay" && (bill.sellerPhone || "").replace(/\D/g, "").length >= 9 && (
          <div className="mt-5 flex flex-col items-center border-t border-dashed border-neutral-200 pt-4">
            <PromptPayQR target={bill.sellerPhone} amount={bill.netPaid} size={160} />
            <p className="mt-1.5 text-xs text-neutral-400">สแกนเพื่อจ่ายผู้ขายด้วยแอปธนาคาร</p>
          </div>
        )}

        <p className="mt-5 border-t border-dashed border-neutral-200 pt-3 text-center text-xs text-neutral-400">
          ขอบคุณที่ใช้บริการ · ออกโดยระบบ Recycle Fund
        </p>
      </div>
    </div>
  );
}
