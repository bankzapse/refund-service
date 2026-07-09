"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PICKUP_ENABLED } from "@/lib/features";
import { canAccessAdminMenu } from "@/lib/permissions";
import { Logo } from "@/components/Logo";
import { LayoutDashboard, Users, Trophy, Tag, LogOut, Recycle, Store, Landmark, Banknote, Truck, Receipt, LayoutGrid, PackageSearch, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, exact: true, pickup: true, menu: null as string | null },
  { href: "/admin/dropgo", label: "Drop Bag", icon: Recycle, pickup: false, menu: "dropgo" },
  { href: "/admin/franchises", label: "แฟรนไชส์", icon: Store, pickup: false, menu: "franchises" },
  { href: "/admin/centers", label: "ศูนย์คัดแยก", icon: PackageSearch, pickup: false, menu: "centers" },
  { href: "/admin/collect", label: "เก็บของ", icon: Truck, pickup: false, menu: "collect" },
  { href: "/admin/payouts", label: "อนุมัติบัญชี", icon: Landmark, pickup: false, menu: "payouts" },
  { href: "/admin/payments", label: "โอนเงิน", icon: Banknote, pickup: false, menu: "payments" },
  { href: "/admin/transfers", label: "ประวัติโอน", icon: Receipt, pickup: false, menu: "transfers" },
  { href: "/admin/buyers", label: "ผู้ซื้อ", icon: Users, pickup: true, menu: null },
  { href: "/admin/rewards", label: "รางวัล", icon: Trophy, pickup: true, menu: null },
  { href: "/admin/prices", label: "อัตราเลทโรงงาน", icon: Tag, pickup: true, menu: null },
].filter((n) => PICKUP_ENABLED || !n.pickup);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { ready, currentUser, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) { router.replace("/app"); return; }
    if (currentUser.role !== "admin") { router.replace("/home"); return; }
    if (currentUser.owner) {
      if (!PICKUP_ENABLED && pathname === "/admin") router.replace("/admin/dropgo");
      return;
    }
    // ผู้ดูแล (ไม่ใช่ owner): กันการเข้าเมนูที่ไม่มีสิทธิ์ผ่าน URL ตรง
    if (pathname === "/admin/team") { router.replace("/app"); return; }
    const menuOf = NAV.find((n) => n.menu && (pathname === n.href || pathname.startsWith(n.href + "/")))?.menu;
    if (pathname === "/admin" || (menuOf && !canAccessAdminMenu(currentUser, menuOf))) {
      const first = NAV.find((n) => n.menu && canAccessAdminMenu(currentUser, n.menu));
      router.replace(first ? first.href : "/app");
    }
  }, [ready, currentUser, router, pathname]);

  if (!ready || !currentUser || currentUser.role !== "admin") {
    return <div className="grid min-h-dvh place-items-center text-neutral-400">กำลังโหลด…</div>;
  }

  // เมนูที่ผู้ใช้ปัจจุบันเข้าถึงได้ (owner = ทุกเมนู, ผู้ดูแล = ตามสิทธิ์)
  const nav = NAV.filter((n) => n.menu == null || canAccessAdminMenu(currentUser, n.menu));

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const doLogout = () => {
    logout();
    router.replace("/app");
  };

  const NavLink = ({ n, mobile }: { n: (typeof NAV)[number]; mobile?: boolean }) => (
    <Link
      href={n.href}
      className={cn(
        mobile
          ? "flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-sm"
          : "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        isActive(n.href, n.exact)
          ? mobile
            ? "bg-brand-600 text-white"
            : "bg-brand-600 text-white shadow-sm"
          : mobile
            ? "bg-neutral-100 text-neutral-500"
            : "text-neutral-600 hover:bg-neutral-100",
      )}
    >
      <n.icon className="h-[18px] w-[18px]" />
      {n.label}
    </Link>
  );

  const ownerLink = { href: "/admin/team", label: "จัดการผู้ดูแล", icon: ShieldCheck, exact: false, pickup: false, menu: null } as (typeof NAV)[number];

  return (
    <div className="min-h-dvh bg-neutral-100">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 text-white shadow-sm md:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Logo size={28} className="rounded-lg bg-white p-0.5" />
          <span className="font-bold">ถุงเขียว <span className="font-medium text-white/50">· บริษัท</span></span>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/app" className="rounded-lg p-2 text-white/80 hover:bg-white/10"><LayoutGrid className="h-5 w-5" /></Link>
            <button onClick={doLogout} className="rounded-lg p-2 text-white/80 hover:bg-white/10"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-white/10 bg-white px-3 py-2">
          {nav.map((n) => <NavLink key={n.href} n={n} mobile />)}
          {currentUser.owner && <NavLink n={ownerLink} mobile />}
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop left sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-neutral-200 bg-white px-3 py-4 md:flex">
          <div className="mb-5 flex items-center gap-2 px-2">
            <Logo size={34} className="rounded-lg" />
            <div className="leading-tight">
              <p className="font-bold text-neutral-800">ถุงเขียว</p>
              <p className="text-xs text-neutral-400">บริษัท (Admin)</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {nav.map((n) => <NavLink key={n.href} n={n} />)}
            {currentUser.owner && (
              <>
                <div className="my-2 border-t border-neutral-100" />
                <NavLink n={ownerLink} />
              </>
            )}
          </nav>

          <div className="mt-3 border-t border-neutral-100 pt-3">
            <div className="mb-2 flex items-center gap-2 px-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{currentUser.name.charAt(0)}</span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold text-neutral-700">{currentUser.name}</p>
                <p className="text-xs text-neutral-400">{currentUser.owner ? "เจ้าของระบบ" : "ผู้ดูแล"}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Link href="/app" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm text-neutral-500 hover:bg-neutral-100"><LayoutGrid className="h-4 w-4" /> สลับระบบ</Link>
              <button onClick={doLogout} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm text-neutral-500 hover:bg-red-50 hover:text-red-500"><LogOut className="h-4 w-4" /> ออก</button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
