/**
 * รูปจริงของวัสดุแต่ละชนิด — ใช้แทน emoji ในการ์ด/รายการราคา
 *
 * ทำไมแยกไฟล์ ไม่ไปใส่ใน MATERIALS:
 * Material ถูก map มาจากตาราง material_prices ด้วย (ดู repo.ts) แถวที่แอดมิน
 * เพิ่มเองใน production จะไม่มีรูป → เก็บ mapping ไว้ฝั่งโค้ดแล้ว fallback
 * เป็น emoji เมื่อไม่มีคีย์ ปลอดภัยกว่าเพิ่มคอลัมน์ในตาราง
 *
 * รูปทั้งหมด Unsplash License (ใช้เชิงพาณิชย์ได้ ไม่ต้องให้เครดิต)
 * ✅ เช็คแล้วว่าไม่ใช่ Unsplash+ (plus/premium = false) — ของ Unsplash+ เป็น
 *    ภาพ Getty ที่ต้องเสียค่าสมาชิก ใช้ไม่ได้
 *   aluminum-can  Donald Giannatti            unsplash.com/photos/yBVfobfL6SA
 *   pet           quokkabottles               unsplash.com/photos/Unr5h0-Qvxs
 *   hdpe          Mehrshad Rajabi             unsplash.com/photos/P7MkoYvSnLI
 *   pp5           Ibrahim Plastic Industry    unsplash.com/photos/atplOtmGcvc
 *   glass-bottle  Andrey Haimin               unsplash.com/photos/QWLQ9vgQEDw
 *   cardboard     Mel                         unsplash.com/photos/quTvuVu0ghQ
 *   other         Bruno Brikmanis-Jurjans     unsplash.com/photos/DTml6vfLMpk
 *
 * เลือกรูปแบบ "กองวัสดุเต็มเฟรม" ไม่ใช่ภาพสินค้าชิ้นเดียวบนพื้นโล่ง เพราะ
 * แสดงจริงแค่ ~44px — ภาพที่ subject เล็กจะเหลือแต่สีพื้นหลัง แยกไม่ออกว่าอะไร
 */
export const MATERIAL_PHOTO: Record<string, string> = {
  "aluminum-can": "/img/materials/aluminum-can.jpg",
  pet: "/img/materials/pet.jpg",
  hdpe: "/img/materials/hdpe.jpg",
  pp5: "/img/materials/pp5.jpg",
  "glass-bottle": "/img/materials/glass-bottle.jpg",
  cardboard: "/img/materials/cardboard.jpg",
  other: "/img/materials/other.jpg",
};
