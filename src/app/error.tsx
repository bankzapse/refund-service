"use client";

import { RefreshCw } from "lucide-react";

// Error boundary ระดับหน้า — error ตอน render → แสดงปุ่มลองใหม่ (ไม่จอขาว)
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-neutral-50 p-6">
      <div className="max-w-sm text-center">
        <div className="text-5xl">😵‍💫</div>
        <h1 className="mt-2 text-xl font-bold text-neutral-800">เกิดข้อผิดพลาด</h1>
        <p className="mb-5 mt-1 text-sm text-neutral-500">ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้ง</p>
        <button onClick={reset} className="btn-primary mx-auto">
          <RefreshCw className="h-4 w-4" /> ลองใหม่
        </button>
      </div>
    </div>
  );
}
