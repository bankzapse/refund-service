"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Modal } from "@/components/ui";
import { AddressPicker } from "@/components/AddressPicker";
import { franchisesWithStats, franchiseRevenue, cabinetsWithCounts, cabinetsForFranchise, type FranchiseWithStats } from "@/lib/selectors";
import { cabinetFullCode, displayCabinetCode } from "@/lib/types";
import { formatBaht, thaiDate } from "@/lib/utils";
import { RevenueExport } from "@/components/RevenueExport";
import { Store, Plus, Box, PackageOpen, Coins, Phone, User, Truck, Building2, Wallet, AlertTriangle, FileSignature, Printer, QrCode, MapPin } from "lucide-react";

const NEAR_FULL = 30; // ถุงค้าง ≥ 30 = ใกล้เต็ม (เข้าเก็บ)
const FULL = 40; // ≥ 40 = เต็ม

type CabForm = { name: string; address: string; province: string; district: string; subdistrict: string };
const EMPTY_CAB: CabForm = { name: "", address: "", province: "", district: "", subdistrict: "" };

export default function AdminFranchisesPage() {
  const { db, addFranchise, addCabinet } = useStore();
  const franchises = franchisesWithStats(db);
  const nearFull = cabinetsWithCounts(db)
    .filter((c) => c.pending >= NEAR_FULL)
    .sort((a, b) => b.pending - a.pending);

  // รวมผ่อนค่าสัญญา/ส่วนแบ่งทั้งหมดทุกแฟรนไชส์
  const totals = franchises.reduce(
    (acc, f) => {
      const r = franchiseRevenue(db, f.id);
      acc.contractRecovered += r.contractRecovered;
      acc.contractTotal += r.contractTotal;
      acc.companyShare += r.companyShare;
      acc.franchiseShare += r.franchiseShare;
      return acc;
    },
    { contractRecovered: 0, contractTotal: 0, companyShare: 0, franchiseShare: 0 },
  );

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");

  const save = () => {
    addFranchise({ code, name, ownerName, phone });
    setCode(""); setName(""); setOwnerName(""); setPhone(""); setOpen(false);
  };

  // เพิ่มตู้ (บริษัทเท่านั้น — ผูกกับสัญญาเช่าซื้อ)
  const [cabFor, setCabFor] = useState<FranchiseWithStats | null>(null);
  const [cab, setCab] = useState<CabForm>({ ...EMPTY_CAB });
  const cabComplete = !!(cab.name.trim() && cab.address.trim() && cab.province && cab.district.trim() && cab.subdistrict.trim());
  const nextTk = "TK-" + String(db.cabinets.map((c) => Number(/^TK0*(\d+)$/.exec(c.code)?.[1] ?? 0)).reduce((a, b) => Math.max(a, b), 0) + 1).padStart(2, "0");
  const openAddCab = (f: FranchiseWithStats) => { setCab({ ...EMPTY_CAB }); setCabFor(f); };

  // พิมพ์ QR ตู้ของแฟรนไชส์ (บริษัทพิมพ์ให้ได้)
  const [qrFor, setQrFor] = useState<FranchiseWithStats | null>(null);
  const qrCabinets = qrFor ? cabinetsForFranchise(db, qrFor.id) : [];
  const saveCab = () => {
    if (!cabFor || !cabComplete) return;
    addCabinet({ name: cab.name, address: cab.address, province: cab.province, district: cab.district, subdistrict: cab.subdistrict, franchiseId: cabFor.id, franchiseCode: cabFor.code });
    setCabFor(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">จัดการแฟรนไชส์</h1>
          <p className="text-sm text-neutral-500">{franchises.length} แฟรนไชส์ · รหัสตู้กำหนดอัตโนมัติ (TK-01, TK-02, …)</p>
        </div>
        <div className="flex items-center gap-2">
          <RevenueExport size="md" />
          <button onClick={() => setOpen(true)} className="btn-primary !px-4 !py-2.5 text-sm"><Plus className="h-4 w-4" /> เพิ่มแฟรนไชส์</button>
        </div>
      </div>

      {/* รวมผ่อนค่าสัญญา / ส่วนแบ่งทั้งหมด */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><FileSignature className="h-4 w-4 text-amber-500" /> ผ่อนค่าสัญญารวมทั้งหมด</div>
          <p className="text-2xl font-extrabold leading-tight text-neutral-800">฿{formatBaht(totals.contractRecovered)} <span className="text-sm font-medium text-neutral-400">/ ฿{formatBaht(totals.contractTotal)}</span></p>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${totals.contractTotal ? Math.min(100, Math.round((totals.contractRecovered / totals.contractTotal) * 100)) : 0}%` }} />
          </div>
        </div>
        <div className="card flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Building2 className="h-4 w-4 text-brand-600" /> บริษัทได้รวมทั้งหมด</div>
          <p className="text-2xl font-extrabold leading-tight text-neutral-800">฿{formatBaht(totals.companyShare)}</p>
          <p className="text-xs text-neutral-400">ส่วนแบ่งบริษัทจากทุกแฟรนไชส์</p>
        </div>
        <div className="card flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Wallet className="h-4 w-4 text-brand-600" /> แฟรนไชส์ได้รวมทั้งหมด</div>
          <p className="text-2xl font-extrabold leading-tight text-brand-700">฿{formatBaht(totals.franchiseShare)}</p>
          <p className="text-xs text-neutral-400">ส่วนแบ่งแฟรนไชส์จากทุกแฟรนไชส์</p>
        </div>
      </div>

      {/* ตู้ใกล้เต็ม — เข้าเก็บของ */}
      <div className="card">
        <h2 className="mb-3 flex items-center gap-1.5 font-bold text-neutral-800">
          <Truck className="h-4 w-4 text-amber-500" /> ตู้ใกล้เต็ม — เข้าเก็บของ ({nearFull.length})
        </h2>
        {nearFull.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">ยังไม่มีตู้ใกล้เต็ม 👍</p>
        ) : (
          <div className="space-y-2">
            {nearFull.map((c) => {
              const full = c.pending >= FULL;
              const area = [c.subdistrict, c.district, c.province].filter(Boolean).join(" · ");
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${full ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                    {full ? <AlertTriangle className="h-4 w-4" /> : <Box className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800">{c.name} <span className="font-mono font-normal text-brand-700">{cabinetFullCode(c.franchiseCode, c.code)}</span></p>
                    <p className="truncate text-xs text-neutral-400">{c.location.address}{area && ` · ${area}`}</p>
                  </div>
                  <div className="w-28 shrink-0">
                    <div className="mb-0.5 flex justify-between text-[11px] text-neutral-400"><span>ถุงค้าง</span><span className="font-semibold">{c.pending}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                      <div className={`h-full rounded-full ${full ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${Math.min(100, (c.pending / FULL) * 100)}%` }} />
                    </div>
                  </div>
                  <span className={`chip shrink-0 ${full ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{full ? "เต็ม" : "ใกล้เต็ม"}</span>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-2 text-[11px] text-neutral-400">บริษัทเข้าเก็บของเก่าจากตู้ให้แฟรนไชส์ · เกณฑ์ ≥ {NEAR_FULL} ถุง = ใกล้เต็ม, ≥ {FULL} = เต็ม</p>
      </div>

      <h2 className="flex items-center gap-1.5 pt-1 font-bold text-neutral-800"><Store className="h-4 w-4 text-brand-600" /> แฟรนไชส์ทั้งหมด</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {franchises.map((f) => (
          <div key={f.id} className="card flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-mono text-sm font-bold">{f.code}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-neutral-800">{f.name}</p>
                <p className="text-xs text-neutral-400">สร้าง {thaiDate(f.createdAt)}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-neutral-500">
              <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {f.ownerName || "-"}</p>
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {f.phone || "-"}</p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
              <span className="chip bg-neutral-100 text-neutral-600"><Box className="h-3.5 w-3.5" /> {f.cabinetCount} ตู้</span>
              <span className="chip bg-neutral-100 text-neutral-600"><PackageOpen className="h-3.5 w-3.5" /> {f.bagCount} ถุง</span>
              <span className="chip bg-brand-50 text-brand-700"><Coins className="h-3.5 w-3.5" /> {formatBaht(f.pointsIssued)} คะแนน</span>
            </div>
            {(() => {
              const rev = franchiseRevenue(db, f.id);
              return (
                <div className="space-y-1.5 border-t border-neutral-100 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">ผ่อนค่าสัญญา</span>
                    <span className="font-semibold text-neutral-600">฿{formatBaht(rev.contractRecovered)} / ฿{formatBaht(rev.contractTotal)}{rev.phase === "active" ? " ✓" : ""}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className={`h-full rounded-full ${rev.phase === "active" ? "bg-brand-500" : "bg-amber-500"}`} style={{ width: `${Math.round(rev.progressPct * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="flex items-center gap-1 text-neutral-500"><Building2 className="h-3 w-3" /> บริษัท ฿{formatBaht(rev.companyShare)}</span>
                    <span className="flex items-center gap-1 font-semibold text-brand-700"><Wallet className="h-3 w-3" /> แฟรนไชส์ ฿{formatBaht(rev.franchiseShare)}</span>
                  </div>
                </div>
              );
            })()}
            <div className="mt-1 flex gap-2">
              <button onClick={() => setQrFor(f)} className="btn-outline flex-1 !py-2 text-sm"><QrCode className="h-4 w-4" /> ตู้ & QR</button>
              <button onClick={() => openAddCab(f)} className="btn-outline flex-1 !py-2 text-sm"><Plus className="h-4 w-4" /> เพิ่มตู้</button>
            </div>
          </div>
        ))}
        {franchises.length === 0 && (
          <div className="card col-span-full flex flex-col items-center gap-2 py-12 text-center text-neutral-400">
            <Store className="h-8 w-8" /> ยังไม่มีแฟรนไชส์ — กด “เพิ่มแฟรนไชส์”
          </div>
        )}
      </div>

      {/* เพิ่มแฟรนไชส์ */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="เพิ่มแฟรนไชส์"
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button className="btn-primary flex-1" disabled={!code.trim()} onClick={save}>บันทึก</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">อักษรย่อแฟรนไชส์ (เช่น GLN)</label>
            <input className="input uppercase" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="GLN" />
          </div>
          <div>
            <label className="label">ชื่อแฟรนไชส์</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Glean กรุงเทพเหนือ" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ชื่อเจ้าของ</label>
              <input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="คุณเอกชัย" />
            </div>
            <div>
              <label className="label">เบอร์โทร</label>
              <input className="input" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
            </div>
          </div>
          <p className="text-xs text-neutral-400">รหัสตู้ของแฟรนไชส์กำหนดอัตโนมัติเป็น <span className="font-mono">TK-01, TK-02, …</span> (บริษัทเป็นผู้เพิ่มตู้ตามสัญญาเช่าซื้อ)</p>
        </div>
      </Modal>

      {/* เพิ่มตู้ (บริษัทเท่านั้น) */}
      <Modal
        open={!!cabFor}
        onClose={() => setCabFor(null)}
        title={cabFor ? `เพิ่มตู้ให้แฟรนไชส์ ${cabFor.code}` : "เพิ่มตู้"}
        footer={
          <>
            <button className="btn-outline flex-1" onClick={() => setCabFor(null)}>ยกเลิก</button>
            <button className="btn-primary flex-1 disabled:opacity-50" disabled={!cabComplete} onClick={saveCab}>บันทึก</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-100">
            <FileSignature className="mr-1 inline h-3.5 w-3.5" /> ตู้ผูกกับสัญญาเช่าซื้อ — บริษัทเป็นผู้เพิ่มให้แฟรนไชส์เท่านั้น
          </div>
          <div className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-700 ring-1 ring-brand-100">รหัสตู้จะถูกกำหนดอัตโนมัติเป็น <b>{nextTk}</b></div>
          <div>
            <label className="label">ชื่อจุดตั้ง</label>
            <input className="input" value={cab.name} onChange={(e) => setCab({ ...cab, name: e.target.value })} placeholder="Lotus's รามอินทรา" />
          </div>
          <div>
            <label className="label">ที่อยู่ / จุดสังเกต</label>
            <input className="input" value={cab.address} onChange={(e) => setCab({ ...cab, address: e.target.value })} placeholder="ชั้น G ทางเข้าหลัก" />
          </div>
          <AddressPicker province={cab.province} district={cab.district} subdistrict={cab.subdistrict} onChange={(v) => setCab({ ...cab, ...v })} />
          {!cabComplete && <p className="text-xs text-amber-600">* กรอกให้ครบทุกช่อง (ชื่อ · ที่อยู่ · จังหวัด · อำเภอ · ตำบล) จึงจะเพิ่มตู้ได้</p>}
        </div>
      </Modal>

      {/* ตู้ของแฟรนไชส์ + พิมพ์ QR */}
      <Modal
        open={!!qrFor}
        onClose={() => setQrFor(null)}
        title={qrFor ? `ตู้ของแฟรนไชส์ ${qrFor.code} (${qrCabinets.length})` : "ตู้ของแฟรนไชส์"}
        footer={<button className="btn-outline w-full" onClick={() => setQrFor(null)}>ปิด</button>}
      >
        {qrCabinets.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">แฟรนไชส์นี้ยังไม่มีตู้ — กด “เพิ่มตู้”</p>
        ) : (
          <div className="space-y-2">
            {qrCabinets.map((c) => {
              const area = [c.subdistrict, c.district, c.province].filter(Boolean).join(" · ");
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Box className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800">{c.name} <span className="font-mono font-normal text-brand-700">{displayCabinetCode(c.code)}</span></p>
                    <p className="flex items-center gap-1 truncate text-xs text-neutral-400"><MapPin className="h-3 w-3 shrink-0" /> {c.location.address}{area && ` · ${area}`}</p>
                  </div>
                  <Link href={`/admin/cabinets/${c.id}/qr`} className="btn-primary shrink-0 !px-3 !py-2 text-xs"><Printer className="h-3.5 w-3.5" /> พิมพ์ QR</Link>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
