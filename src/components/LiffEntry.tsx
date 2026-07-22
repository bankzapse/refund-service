"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { liffConfigured, isInLineClient } from "@/lib/liff";

/**
 * เปิดจากในแอป LINE ที่หน้าแรก (/) → พาเข้าแอปเลย ไม่ต้องดูหน้าการตลาด
 *
 * ทำไมต้องแก้ที่นี่ ไม่ใช่เปลี่ยน LIFF endpoint เป็น /app:
 * LIFF เอา path ต่อท้าย endpoint URL — ถ้าตั้ง endpoint เป็น /app แล้ว
 * liff.line.me/<id>/drop จะกลายเป็น /app/drop ซึ่งไม่มีอยู่จริง
 * → ปุ่มใน Rich Menu พังทั้งหมด · endpoint จึงต้องเป็น root เสมอ
 */
export function LiffEntry() {
  const router = useRouter();

  useEffect(() => {
    if (!liffConfigured) return;
    let cancelled = false;
    isInLineClient()
      .then((inLine) => {
        if (!cancelled && inLine) router.replace("/app");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
