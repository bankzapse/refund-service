"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Modal } from "@/components/ui";
import { franchiseById, cabinetsForFranchise } from "@/lib/selectors";
import { cabinetFullCode } from "@/lib/types";
import { Box, PackageOpen, Plus, MapPin, QrCode, Printer, Store } from "lucide-react";

export default function FranchiseCabinetsPage() {
  const { db, currentUser, addCabinet } = useStore();
  const u = currentUser!;
  const fr = franchiseById(db, u.franchiseId ?? "");
  const cabinets = cabinetsForFranchise(db, u.franchiseId ?? "");

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [subdistrict, setSubdistrict] = useState("");

  if (!fr) return <p className="py-16 text-center text-neutral-400">ไม่พบข้อมูลแฟรนไชส์</p>;

  const save = () => {
    addCabinet({ code, name, address, province, district, subdistrict, franchiseId: fr.id, franchiseCode: fr.code });
    setCode(""); setName(""); setAddress(""); setProvince(""); setDistrict(""); setSubdistrict(""); setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">รหัสตู้ของคุณ</h1>
          <p className="text-sm text-neutral-500">{cabinets.length} ตู้ · QR ถุง = <span className="font-mono">{fr.code}-ตู้-ถุง</span> (สแกนครั้งเดียวได้ทั้งตู้และถุง)</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary !px-4 !py-2.5 text-sm"><Plus className="h-4 w-4" /> เพิ่มตู้</button>
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
                  <p className="font-mono text-sm font-semibold text-brand-700">{cabinetFullCode(c.franchiseCode, c.code)}</p>
                </div>
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
        <QrCode className="h-3.5 w-3.5" /> QR ถุง = <span className="font-mono">{fr.code}-AA-0000001</span> (แฟรนไชส์-ตู้-ถุง) · คนทิ้งสแกนครั้งเดียวได้ทั้งตู้และถุง
      </p>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`เพิ่มตู้ในแฟรนไชส์ ${fr.code}`}
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button className="btn-primary flex-1" disabled={!code.trim()} onClick={save}>บันทึก</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">รหัสตู้ (เช่น AC)</label>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-neutral-100 px-2.5 py-2 font-mono text-sm font-semibold text-neutral-500">{fr.code}-</span>
              <input className="input flex-1 uppercase" maxLength={4} value={code} onChange={(e) => setCode(e.target.value)} placeholder="AC" />
            </div>
          </div>
          <div>
            <label className="label">ชื่อจุดตั้ง</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Lotus's รามอินทรา" />
          </div>
          <div>
            <label className="label">ที่อยู่ / จุดสังเกต</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ชั้น G ทางเข้าหลัก" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label">จังหวัด</label>
              <input className="input !px-2" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="กรุงเทพฯ" />
            </div>
            <div>
              <label className="label">อำเภอ/เขต</label>
              <input className="input !px-2" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="จตุจักร" />
            </div>
            <div>
              <label className="label">ตำบล/แขวง</label>
              <input className="input !px-2" value={subdistrict} onChange={(e) => setSubdistrict(e.target.value)} placeholder="จอมพล" />
            </div>
          </div>
          <p className="text-xs text-neutral-400">QR ถุงจะเป็น <span className="font-mono">{fr.code}-{code.trim().toUpperCase() || "AC"}-0000001</span></p>
        </div>
      </Modal>
    </div>
  );
}
