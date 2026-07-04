"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Recycle } from "lucide-react";

export default function Index() {
  const { ready, currentUser } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(currentUser ? "/home" : "/login");
  }, [ready, currentUser, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-brand-600 text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <Recycle className="h-9 w-9 animate-pulse" />
      </div>
      <p className="text-lg font-bold">Recycle Fund</p>
    </div>
  );
}
