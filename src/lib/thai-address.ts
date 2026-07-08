/**
 * ข้อมูลที่อยู่ไทย (จังหวัด → อำเภอ/เขต → ตำบล/แขวง) สำหรับ dropdown เลือกตามสเต็ป
 * ชุดเริ่มต้น (ครอบคลุมจังหวัด/พื้นที่หลัก) — เพิ่มเติมได้ภายหลัง
 */
export interface AddressDistrict {
  name: string;
  subdistricts: string[];
}
export interface AddressProvince {
  name: string;
  districts: AddressDistrict[];
}

export const THAI_ADDRESS: AddressProvince[] = [
  {
    name: "กรุงเทพมหานคร",
    districts: [
      { name: "จตุจักร", subdistricts: ["จอมพล", "จันทรเกษม", "ลาดยาว", "เสนานิคม"] },
      { name: "คลองเตย", subdistricts: ["คลองเตย", "คลองตัน", "พระโขนง"] },
      { name: "บางกะปิ", subdistricts: ["คลองจั่น", "หัวหมาก"] },
      { name: "ห้วยขวาง", subdistricts: ["ห้วยขวาง", "บางกะปิ", "สามเสนนอก"] },
      { name: "วัฒนา", subdistricts: ["คลองเตยเหนือ", "คลองตันเหนือ", "พระโขนงเหนือ"] },
      { name: "ดินแดง", subdistricts: ["ดินแดง", "รัชดาภิเษก"] },
      { name: "พญาไท", subdistricts: ["สามเสนใน"] },
      { name: "ลาดพร้าว", subdistricts: ["ลาดพร้าว", "จรเข้บัว"] },
      { name: "บางรัก", subdistricts: ["สีลม", "สุริยวงศ์", "มหาพฤฒาราม", "สี่พระยา", "บางรัก"] },
      { name: "ปทุมวัน", subdistricts: ["ลุมพินี", "ปทุมวัน", "รองเมือง", "วังใหม่"] },
    ],
  },
  {
    name: "นนทบุรี",
    districts: [
      { name: "เมืองนนทบุรี", subdistricts: ["บางกระสอ", "ตลาดขวัญ", "สวนใหญ่", "ท่าทราย"] },
      { name: "ปากเกร็ด", subdistricts: ["ปากเกร็ด", "บางตลาด", "บ้านใหม่", "คลองเกลือ"] },
      { name: "บางบัวทอง", subdistricts: ["โสนลอย", "บางบัวทอง", "พิมลราช"] },
    ],
  },
  {
    name: "ปทุมธานี",
    districts: [
      { name: "เมืองปทุมธานี", subdistricts: ["บางปรอก", "บางพูด", "บ้านกลาง"] },
      { name: "ธัญบุรี", subdistricts: ["ประชาธิปัตย์", "รังสิต", "บึงยี่โถ"] },
      { name: "คลองหลวง", subdistricts: ["คลองหนึ่ง", "คลองสอง", "คลองสาม"] },
    ],
  },
  {
    name: "สมุทรปราการ",
    districts: [
      { name: "เมืองสมุทรปราการ", subdistricts: ["ปากน้ำ", "สำโรงเหนือ", "บางเมือง"] },
      { name: "บางพลี", subdistricts: ["บางพลีใหญ่", "บางแก้ว", "ราชาเทวะ"] },
      { name: "พระประแดง", subdistricts: ["ตลาด", "บางพึ่ง", "บางครุ"] },
    ],
  },
  {
    name: "ชลบุรี",
    districts: [
      { name: "เมืองชลบุรี", subdistricts: ["บางปลาสร้อย", "มะขามหย่ง", "บ้านสวน"] },
      { name: "บางละมุง", subdistricts: ["หนองปรือ", "นาเกลือ", "บางละมุง"] },
      { name: "ศรีราชา", subdistricts: ["ศรีราชา", "สุรศักดิ์", "ทุ่งสุขลา"] },
    ],
  },
  {
    name: "เชียงใหม่",
    districts: [
      { name: "เมืองเชียงใหม่", subdistricts: ["ศรีภูมิ", "พระสิงห์", "สุเทพ", "ช้างคลาน"] },
      { name: "สันทราย", subdistricts: ["สันทรายหลวง", "หนองจ๊อม", "แม่แฝก"] },
      { name: "หางดง", subdistricts: ["หางดง", "หนองแก๋ว", "บ้านแหวน"] },
    ],
  },
  {
    name: "ขอนแก่น",
    districts: [
      { name: "เมืองขอนแก่น", subdistricts: ["ในเมือง", "ศิลา", "บ้านเป็ด"] },
      { name: "ชุมแพ", subdistricts: ["ชุมแพ", "โนนหัน", "ไชยสอ"] },
    ],
  },
  {
    name: "นครราชสีมา",
    districts: [
      { name: "เมืองนครราชสีมา", subdistricts: ["ในเมือง", "หัวทะเล", "โพธิ์กลาง"] },
      { name: "ปากช่อง", subdistricts: ["ปากช่อง", "หนองสาหร่าย", "ขนงพระ"] },
    ],
  },
  {
    name: "ภูเก็ต",
    districts: [
      { name: "เมืองภูเก็ต", subdistricts: ["ตลาดใหญ่", "ตลาดเหนือ", "รัษฎา", "วิชิต"] },
      { name: "กะทู้", subdistricts: ["กะทู้", "ป่าตอง", "กมลา"] },
      { name: "ถลาง", subdistricts: ["เชิงทะเล", "เทพกระษัตรี", "ไม้ขาว"] },
    ],
  },
  {
    name: "สงขลา",
    districts: [
      { name: "หาดใหญ่", subdistricts: ["หาดใหญ่", "คอหงส์", "ควนลัง"] },
      { name: "เมืองสงขลา", subdistricts: ["บ่อยาง", "เขารูปช้าง", "พะวง"] },
    ],
  },
  {
    name: "เชียงราย",
    districts: [
      { name: "เมืองเชียงราย", subdistricts: ["เวียง", "รอบเวียง", "บ้านดู่"] },
      { name: "แม่สาย", subdistricts: ["แม่สาย", "เวียงพางคำ", "ห้วยไคร้"] },
    ],
  },
  {
    name: "อุดรธานี",
    districts: [
      { name: "เมืองอุดรธานี", subdistricts: ["หมากแข้ง", "หนองบัว", "บ้านเลื่อม"] },
      { name: "กุมภวาปี", subdistricts: ["กุมภวาปี", "ตูมใต้", "พันดอน"] },
    ],
  },
];

export const PROVINCES = THAI_ADDRESS.map((p) => p.name);
export function districtsOf(province: string): AddressDistrict[] {
  return THAI_ADDRESS.find((p) => p.name === province)?.districts ?? [];
}
export function subdistrictsOf(province: string, district: string): string[] {
  return districtsOf(province).find((d) => d.name === district)?.subdistricts ?? [];
}
