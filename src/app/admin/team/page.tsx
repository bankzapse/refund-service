"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Modal } from "@/components/ui";
import { ADMIN_MENUS } from "@/lib/permissions";
import { ShieldCheck, Plus, Phone, Trash2, Crown, User, KeyRound, Pencil } from "lucide-react";

export default function AdminTeamPage() {
  const { db, currentUser, addAdmin, removeAdmin, setAdminPermissions } = useStore();
  const admins = useMemo(() => db.users.filter((u) => u.role === "admin"), [db.users]);
  const isOwner = !!currentUser?.owner;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  if (!isOwner) {
    return (
      <div className="card mx-auto max-w-md py-14 text-center text-neutral-400">
        <ShieldCheck className="mx-auto mb-2 h-8 w-8" /> เฉพาะเจ้าของระบบ (Owner) เท่านั้นที่จัดการผู้ดูแลได้
      </div>
    );
  }

  const toggle = (k: string) => setPerms((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const valid = !!(name.trim() && /^0\d{8,9}$/.test(phone.trim()) && password.length >= 4);

  const save = () => {
    addAdmin({ name, phone, password, permissions: perms });
    if (valid) { setName(""); setPhone(""); setPassword(""); setPerms([]); setOpen(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">จัดการผู้ดูแล</h1>
          <p className="text-sm text-neutral-500">เจ้าของระบบเพิ่ม/ลบผู้ดูแล และกำหนดสิทธิ์เข้าถึงเมนูได้</p>
        </div>
        <button onClick={() => { setName(""); setPhone(""); setPassword(""); setPerms([]); setOpen(true); }} className="btn-primary !px-4 !py-2.5 text-sm"><Plus className="h-4 w-4" /> เพิ่มผู้ดูแล</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {admins.map((a) => (
          <div key={a.id} className="card">
            <div className="mb-3 flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.owner ? "bg-gold/15 text-gold-dark" : "bg-brand-100 text-brand-700"}`}>
                {a.owner ? <Crown className="h-6 w-6" /> : <User className="h-6 w-6" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-neutral-800">{a.name}</p>
                <p className="flex items-center gap-1 text-xs text-neutral-400"><Phone className="h-3 w-3" /> {a.phone}</p>
              </div>
              {a.owner ? (
                <span className="chip bg-gold/15 text-gold-dark"><Crown className="h-3.5 w-3.5" /> Owner</span>
              ) : (
                <div className="flex gap-1">
                  <button onClick={() => setEditId(editId === a.id ? null : a.id)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => removeAdmin(a.id)} className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>

            {a.owner ? (
              <p className="rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-500">เข้าถึงได้ทุกเมนู + จัดการผู้ดูแล</p>
            ) : (
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {ADMIN_MENUS.filter((m) => (a.permissions ?? []).includes(m.key)).map((m) => (
                    <span key={m.key} className="chip bg-brand-50 text-brand-700">{m.label}</span>
                  ))}
                  {(a.permissions ?? []).length === 0 && <span className="text-xs text-neutral-400">ยังไม่ได้กำหนดสิทธิ์</span>}
                </div>
                {editId === a.id && (
                  <div className="mt-3 space-y-1.5 rounded-xl bg-neutral-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-neutral-500">เลือกเมนูที่เข้าถึงได้</p>
                    {ADMIN_MENUS.map((m) => {
                      const on = (a.permissions ?? []).includes(m.key);
                      return (
                        <label key={m.key} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => setAdminPermissions(a.id, on ? (a.permissions ?? []).filter((x) => x !== m.key) : [...(a.permissions ?? []), m.key])}
                            className="h-4 w-4 accent-brand-600"
                          />
                          {m.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="เพิ่มผู้ดูแล"
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button className="btn-primary flex-1 disabled:opacity-50" disabled={!valid} onClick={save}>สร้างบัญชี</button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="ชื่อผู้ดูแล" icon={<User className="h-4 w-4" />}><input className="input pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น สมหญิง (ฝ่ายการเงิน)" /></Field>
          <Field label="เบอร์โทร (ใช้เข้าสู่ระบบ)" icon={<Phone className="h-4 w-4" />}><input className="input pl-9" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="09x-xxx-xxxx" /></Field>
          <Field label="รหัสผ่าน" icon={<KeyRound className="h-4 w-4" />}><input className="input pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="อย่างน้อย 4 ตัวอักษร" /></Field>
          <div>
            <label className="label">สิทธิ์เข้าถึงเมนู</label>
            <div className="space-y-1.5 rounded-xl bg-neutral-50 p-3">
              {ADMIN_MENUS.map((m) => (
                <label key={m.key} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={perms.includes(m.key)} onChange={() => toggle(m.key)} className="h-4 w-4 accent-brand-600" />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
          <p className="rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-500">ผู้ดูแลเข้าสู่ระบบที่ <span className="font-mono text-brand-700">/login/company</span> ด้วยเบอร์ + รหัสผ่านนี้</p>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>
        {children}
      </div>
    </div>
  );
}
