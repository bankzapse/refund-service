"use client";

import { useEffect } from "react";
import { initNativeApp } from "@/lib/native";

/** เรียก setup ของแอป native ครั้งเดียวตอน mount (no-op บนเว็บ/LINE) */
export function NativeBootstrap() {
  useEffect(() => {
    initNativeApp();
  }, []);
  return null;
}
