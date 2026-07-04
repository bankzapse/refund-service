"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { billsForBuyer } from "@/lib/selectors";
import { formatBaht, thaiDateTime } from "@/lib/utils";
import { Plus, Receipt } from "lucide-react";

export default function BillsPage() {
  const router = useRouter();
  const { db, currentUser } = useStore();
  const bills = billsForBuyer(db, currentUser!.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">บิลรับซื้อ</h1>
          <p className="text-sm text-neutral-500">ทั้งหมด {bills.length} บิล</p>
        </div>
        <Link href="/shop/bills/new" className="btn-primary !px-4 !py-2.5 text-sm">
          <Plus className="h-4 w-4" /> สร้างบิล
        </Link>
      </div>

      {bills.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-16 text-center">
          <Receipt className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-600">ยังไม่มีบิล</p>
          <p className="text-sm text-neutral-400">กด “สร้างบิล” เพื่อบันทึกการรับซื้อครั้งแรก</p>
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs text-neutral-500">
                <th className="px-4 py-3 font-medium">เลขบิล</th>
                <th className="px-4 py-3 font-medium">วันที่</th>
                <th className="px-4 py-3 font-medium">ผู้ขาย</th>
                <th className="px-4 py-3 text-right font-medium">ยอดรับซื้อ</th>
                <th className="px-4 py-3 text-right font-medium">ค่าบริการ</th>
                <th className="px-4 py-3 text-right font-medium">จ่ายสุทธิ</th>
                <th className="px-4 py-3 font-medium">ชำระ</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/shop/bill/${b.id}`)}
                  className="cursor-pointer border-b border-neutral-50 transition hover:bg-neutral-50"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-neutral-600">{b.code}</td>
                  <td className="px-4 py-3 text-neutral-500">{thaiDateTime(b.date)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-800">{b.sellerName}</span>
                    {b.source === "app_job" && <span className="ml-1.5 chip bg-blue-50 text-blue-600">จากแอป</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-neutral-800">฿{formatBaht(b.goodsTotal)}</td>
                  <td className="px-4 py-3 text-right text-amber-600">฿{formatBaht(b.fee)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-700">฿{formatBaht(b.netPaid)}</td>
                  <td className="px-4 py-3 text-neutral-500">{b.paymentMethod === "cash" ? "เงินสด" : b.paymentMethod === "transfer" ? "โอน" : "พร้อมเพย์"}</td>
                  <td className="px-4 py-3">
                    {b.status === "void" ? (
                      <span className="chip bg-neutral-200 text-neutral-500">ยกเลิก</span>
                    ) : (
                      <span className="chip bg-brand-100 text-brand-700">จ่ายแล้ว</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
