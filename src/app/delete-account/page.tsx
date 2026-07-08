import type { Metadata } from "next";
import { LegalShell, Sec, UL } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "ขอลบบัญชีและข้อมูล — GreenDrop",
  description: "วิธีขอลบบัญชีและข้อมูลส่วนบุคคลออกจาก GreenDrop (กรีนดรอป)",
};

export default function DeleteAccountPage() {
  return (
    <LegalShell title="ขอลบบัญชีและข้อมูล" subtitle="Account & Data Deletion — GreenDrop (กรีนดรอป)" updated="8 กรกฎาคม 2569 (2026)">
      <p>
        คุณสามารถขอลบบัญชี GreenDrop และข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา หน้านี้อธิบายวิธีขอ ข้อมูลที่จะถูกลบ และระยะเวลาดำเนินการ
        (ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)
      </p>

      <Sec n={1} title="วิธีขอลบบัญชี">
        <UL
          items={[
            <><b>ในแอป:</b> ตั้งค่า → บัญชี → “ลบบัญชี” แล้วยืนยัน (เมื่อเปิดใช้ฟีเจอร์นี้)</>,
            <><b>อีเมล:</b> ส่งคำขอมาที่ <a href="mailto:support@greendrop.co?subject=ขอลบบัญชี%20GreenDrop" className="text-brand-600">support@greendrop.co</a> พร้อมเบอร์โทร/อีเมลที่ใช้สมัคร</>,
            <><b>LINE:</b> ทักหาเราที่ <b>@greendrop</b> แจ้ง “ขอลบบัญชี”</>,
          ]}
        />
        <p className="text-sm text-neutral-500">เพื่อความปลอดภัย เราจะยืนยันตัวตนก่อนดำเนินการลบ</p>
      </Sec>

      <Sec n={2} title="ข้อมูลที่จะถูกลบ">
        <UL
          items={[
            "ข้อมูลบัญชี: เบอร์โทร, อีเมล, ชื่อ/รูปจาก LINE, LINE User ID",
            "ประวัติการหย่อนถุง, คะแนนคงเหลือ และประวัติคะแนน",
            "บัญชีรับเงิน (พร้อมเพย์/ธนาคาร) ที่บันทึกไว้",
          ]}
        />
      </Sec>

      <Sec n={3} title="ข้อมูลที่อาจเก็บต่อ (ตามกฎหมาย)">
        <p>เราอาจเก็บบางข้อมูลเท่าที่จำเป็นตามกฎหมาย เช่น หลักฐานการโอนเงิน/ธุรกรรมที่ต้องเก็บตามกฎหมายบัญชี-ภาษี หรือเพื่อป้องกันการทุจริต โดยจะเก็บเท่าระยะเวลาที่กฎหมายกำหนด แล้วลบหรือทำให้ไม่ระบุตัวตน</p>
      </Sec>

      <Sec n={4} title="คะแนนคงเหลือ">
        <p>โปรดแลกคะแนนเป็นเงินก่อนขอลบบัญชี — เมื่อลบบัญชีแล้ว คะแนนคงเหลือจะถูกยกเลิกและไม่สามารถกู้คืนได้</p>
      </Sec>

      <Sec n={5} title="ระยะเวลาดำเนินการ">
        <p>เราจะดำเนินการลบภายใน <b>30 วัน</b> นับจากยืนยันคำขอ และจะแจ้งผลกลับทางอีเมล/LINE</p>
      </Sec>

      <Sec n={6} title="ติดต่อ">
        <p>บริษัท [ชื่อบริษัท] จำกัด · อีเมล: <a href="mailto:support@greendrop.co" className="text-brand-600">support@greendrop.co</a> · LINE: @greendrop</p>
      </Sec>
    </LegalShell>
  );
}
