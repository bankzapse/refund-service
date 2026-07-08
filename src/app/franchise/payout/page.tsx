"use client";

import { PayoutCard } from "@/components/PayoutCard";

export default function FranchisePayoutPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">บัญชีรับเงินโอน</h1>
        <p className="text-sm text-neutral-500">บัญชีสำหรับรับส่วนแบ่งรายได้จากบริษัท · ต้องบริษัทอนุมัติก่อนจึงรับเงินได้</p>
      </div>
      <div className="max-w-lg"><PayoutCard /></div>
    </div>
  );
}
