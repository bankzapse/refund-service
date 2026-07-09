"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Modal } from "@/components/ui";
import { AddressPicker } from "@/components/AddressPicker";
import { franchiseById, cabinetsForFranchise, type CabinetWithCounts } from "@/lib/selectors";
import { displayCabinetCode } from "@/lib/types";
import { Box, PackageOpen, Plus, MapPin, QrCode, Printer, Store, Pencil } from "lucide-react";

type Form = { name: string; address: string; province: string; district: string; subdistrict: string };
const EMPTY: Form = { name: "", address: "", province: "", district: "", subdistrict: "" };

function CabinetFields({ f, setF }: { f: Form; setF: (v: Form) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="label">ชื่อจุดตั้ง</label>
        <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Lotus's รามอินทรา" />
      </div>
      <div>
        <label className="label">ที่อยู่ / จุดสังเกต</label>
        <input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="ชั้น G ทางเข้าหลัก" />
      </div>
      <AddressPicker province={f.province} district={f.district} subdistrict={f.subdistrict} onChange={(v) => setF({ ...f, ...v })} />
    </div>
  );
}

export default function FranchiseCabinetsPage() {
  const { db, currentUser, addCabinet, editCabinet } = useStore();
  const u = currentUser!;
  const fr = franchiseById(db, u.franchiseId ?? "");
  const cabinets = cabinetsForFranchise(db, u.franchiseId ?? "");

  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<CabinetWithCounts | null>(null);
  const [f, setF] = useState({ ...EMPTY });

  const complete = !!(f.name.trim() && f.address.trim() && f.province && f.district.trim() && f.subdistrict.trim());

  if (!fr) return <p className="py-16 text-center text-neutral-400">ไม่พบข้อมูลแฟรนไชส์</p>;

  const openAdd = () => { setF({ ...EMPTY }); setAddOpen(true); };
  const openEdit = (c: CabinetWithCounts) => {
    setF({ name: c.name, address: c.location.address, province: c.province ?? "", district: c.district ?? "", subdistrict: c.subdistrict ?? "" });
    setEdit(c);
  };

  const saveAdd = () => {
    if (!complete) return;
    addCabinet({ name: f.name, address: f.address, province: f.province, district: f.district, subdistrict: f.subdistrict, franchiseId: fr.id, franchiseCode: fr.code });
    setAddOpen(false);
  };
  const saveEdit = () => {
    if (!edit || !complete) return;
    editCabinet(edit.id, { name: f.name, address: f.address, province: f.province, district: f.district, subdistrict: f.subdistrict });
    setEdit(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">รหัสตู้ของคุณ</h1>
          <p className="text-sm text-neutral-500">{cabinets.length} ตู้ · รหัสตู้กำหนดอัตโนมัติ (TK-01, TK-02, …) · QR = <span className="font-mono">TK01-ถุง</span></p>
        </div>
        <button onClick={openAdd} className="btn-primary !px-4 !py-2.5 text-sm"><Plus className="h-4 w-4" /> เพิ่มตู้</button>
      </div>

      {cabinets.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-12 text-center text-neutral-400">
          <Store className="h-8 w-8" /> ยังไม่มีตู้ — กด “เพิ่มตู้”
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cabinets.map((c) => (
            <div key={c.id} className="card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Box className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-neutral-800">{c.name}</p>
                  <p className="font-mono text-sm font-semibold text-brand-700">{displayCabinetCode(c.code)}</p>
                </div>
                <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-brand-600" aria-label="แก้ไข"><Pencil className="h-4 w-4" /></button>
              </div>
              <div className="text-xs text-neutral-500">
                <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.location.address}</p>
                {(c.subdistrict || c.district || c.province) && (
                  <p className="ml-5 mt-0.5 text-neutral-400">{[c.subdistrict, c.district, c.province].filter(Boolean).join(" · ")}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`chip ${c.pending > 0 ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"}`}>
                  <PackageOpen className="h-3.5 w-3.5" /> {c.pending} รอคัดแยก
                </span>
                <span className="chip bg-neutral-100 text-neutral-500">{c.total} ถุงรวม</span>
              </div>
              <Link href={`/franchise/cabinets/${c.id}/qr`} className="btn-outline w-full !py-2 text-sm">
                <Printer className="h-4 w-4" /> พิมพ์ QR ตู้+ถุง
              </Link>
            </div>
          ))}
        </div>
      )}
      <p className="flex items-center gap-1 text-xs text-neutral-400">
        <QrCode className="h-3.5 w-3.5" /> QR ถุง = <span className="font-mono">TK01-0000001</span> (ตู้-ถุง) · คนทิ้งสแกนครั้งเดียวได้ทั้งตู้และถุง
      </p>

      {/* เพิ่มตู้ */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`เพิ่มตู้ในแฟรนไชส์ ${fr.code}`}
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setAddOpen(false)}>ยกเลิก</button>
            <button className="btn-primary flex-1 disabled:opacity-50" disabled={!complete} onClick={saveAdd}>บันทึก</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-700 ring-1 ring-brand-100">รหัสตู้จะถูกกำหนดอัตโนมัติเป็น <b>TK-{String((db.cabinets.map((c) => Number(/^TK0*(\d+)$/.exec(c.code)?.[1] ?? 0)).reduce((a, b) => Math.max(a, b), 0)) + 1).padStart(2, "0")}</b></div>
          <CabinetFields f={f} setF={setF} />
          {!complete && <p className="text-xs text-amber-600">* กรอกให้ครบทุกช่อง (ชื่อ · ที่อยู่ · จังหวัด · อำเภอ · ตำบล) จึงจะเพิ่มตู้ได้</p>}
        </div>
      </Modal>

      {/* แก้ไขตู้ */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={`แก้ไขตู้ ${edit ? displayCabinetCode(edit.code) : ""}`}
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setEdit(null)}>ยกเลิก</button>
            <button className="btn-primary flex-1 disabled:opacity-50" disabled={!complete} onClick={saveEdit}>บันทึกการแก้ไข</button>
          </>
        }
      >
        <div className="space-y-3">
          <CabinetFields f={f} setF={setF} />
          {!complete && <p className="text-xs text-amber-600">* กรอกให้ครบทุกช่องจึงจะบันทึกได้</p>}
        </div>
      </Modal>
    </div>
  );
}
