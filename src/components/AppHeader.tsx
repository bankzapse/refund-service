"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function AppHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-100 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-1.5 px-4">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="ย้อนกลับ"
            className="-ml-2 rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-neutral-400">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}
