"use client";

import { useState } from "react";

/** รูปประกอบ (Unsplash ฟรี) — ถ้าโหลดไม่ได้ fallback เป็น gradient เขียว จะไม่มีรูปแตก */
export function Photo({ src, alt, className, grad = "from-brand-400 to-emerald-600" }: { src: string; alt: string; className?: string; grad?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <div className={`bg-gradient-to-br ${grad} ${className ?? ""}`} aria-label={alt} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setOk(false)} className={className} />
  );
}
