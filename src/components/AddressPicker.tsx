"use client";

import { PROVINCES, districtsOf, subdistrictsOf } from "@/lib/thai-address";

/**
 * เลือกที่อยู่แบบสเต็ป: จังหวัด → อำเภอ/เขต → ตำบล/แขวง
 * จังหวัดครบทั่วไทย (77) · จังหวัดที่มีข้อมูลจะเลือกต่อเป็น dropdown, จังหวัดอื่นให้พิมพ์เอง
 */
export function AddressPicker({
  province,
  district,
  subdistrict,
  onChange,
}: {
  province: string;
  district: string;
  subdistrict: string;
  onChange: (v: { province: string; district: string; subdistrict: string }) => void;
}) {
  const districts = districtsOf(province);
  const subs = subdistrictsOf(province, district);
  const districtIsSelect = districts.length > 0;
  const subIsSelect = subs.length > 0;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <label className="label">จังหวัด</label>
        <select className="input bg-white !px-2 text-sm" value={province} onChange={(e) => onChange({ province: e.target.value, district: "", subdistrict: "" })}>
          <option value="">— เลือก —</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="label">อำเภอ/เขต</label>
        {districtIsSelect ? (
          <select className="input bg-white !px-2 text-sm disabled:opacity-50" value={district} disabled={!province} onChange={(e) => onChange({ province, district: e.target.value, subdistrict: "" })}>
            <option value="">— เลือก —</option>
            {districts.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        ) : (
          <input className="input !px-2 text-sm disabled:opacity-50" value={district} disabled={!province} placeholder="พิมพ์อำเภอ/เขต" onChange={(e) => onChange({ province, district: e.target.value, subdistrict: subdistrict })} />
        )}
      </div>
      <div>
        <label className="label">ตำบล/แขวง</label>
        {subIsSelect ? (
          <select className="input bg-white !px-2 text-sm disabled:opacity-50" value={subdistrict} disabled={!district} onChange={(e) => onChange({ province, district, subdistrict: e.target.value })}>
            <option value="">— เลือก —</option>
            {subs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <input className="input !px-2 text-sm disabled:opacity-50" value={subdistrict} disabled={!district} placeholder="พิมพ์ตำบล/แขวง" onChange={(e) => onChange({ province, district, subdistrict: e.target.value })} />
        )}
      </div>
    </div>
  );
}
