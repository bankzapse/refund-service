"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Store, Truck, Loader2 } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { register, currentUser } = useStore();

  const [role, setRole] = useState<Role>("seller");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentUser) router.replace(currentUser.role === "admin" ? "/admin" : "/home");
  }, [currentUser, router]);

  const submit = async () => {
    setErr("");
    setInfo("");
    if (name.trim().length < 2) return setErr("กรุณากรอกชื่อ-นามสกุล");

    if (supabaseConfigured) {
      if (!email.trim()) return setErr("กรุณากรอกอีเมลสำหรับสมัครใช้งาน");
      if (password.length < 6) return setErr("รหัสผ่านอย่างน้อย 6 ตัวอักษร");
      setBusy(true);
      const { data, error } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim(), role },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      setBusy(false);
      if (error) return setErr(error.message);
      if (!data.session) setInfo("สมัครสำเร็จ! ตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วเข้าสู่ระบบ");
      // ถ้ามี session (ปิด email confirm) → store hydrate → effect redirect
    } else {
      if (!/^0\d{8,9}$/.test(phone.trim())) return setErr("เบอร์โทรไม่ถูกต้อง");
      register({ name, phone, email: email || undefined, role });
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <div className="flex items-center gap-2 px-4 pb-2 pt-5">
        <Link href="/login" className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">ลงทะเบียน</h1>
      </div>

      <div className="px-5 pt-2">
        <label className="label">ต้องการใช้งานเป็น</label>
        <div className="mb-4 grid grid-cols-2 gap-3">
          {(
            [
              { v: "seller", label: "ผู้ขาย", hint: "มีของเก่าจะขาย", icon: Store },
              { v: "buyer", label: "ผู้ซื้อ / คนขับ", hint: "รับซื้อของเก่า", icon: Truck },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              onClick={() => setRole(o.v)}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-2xl border-2 p-3 text-left transition",
                role === o.v ? "border-brand-500 bg-brand-50" : "border-neutral-200 bg-white",
              )}
            >
              <o.icon className={cn("h-5 w-5", role === o.v ? "text-brand-600" : "text-neutral-400")} />
              <p className="font-semibold text-neutral-800">{o.label}</p>
              <p className="text-xs text-neutral-400">{o.hint}</p>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">ชื่อ-นามสกุล</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น สมชาย ใจดี" />
          </div>
          <div>
            <label className="label">เบอร์โทรศัพท์{supabaseConfigured && " (ไม่บังคับ)"}</label>
            <input className="input" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
          </div>
          <div>
            <label className="label">อีเมล{supabaseConfigured ? "" : " (ไม่บังคับ)"}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          {info && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{info}</p>}
          <button className="btn-primary mt-1 w-full" onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "สร้างบัญชีและเข้าสู่ระบบ"}
          </button>
          <p className="pb-8 text-center text-sm text-neutral-500">
            มีบัญชีแล้ว?{" "}
            <Link href="/login" className="font-semibold text-brand-600">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-400">กำลังโหลด…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
