import Image from "next/image";
import { MATERIAL_PHOTO } from "@/lib/materialPhotos";

/**
 * ไอคอนวัสดุ — รูปจริงถ้ามี ไม่มีก็ตกกลับไป emoji
 * (วัสดุที่แอดมินเพิ่มเองใน production จะไม่มีรูป — ดู lib/materialPhotos.ts)
 *
 * เป็นภาพประกอบล้วน ๆ ชื่อวัสดุอยู่ข้าง ๆ อยู่แล้ว → alt="" ไม่ให้ screen reader
 * อ่านซ้ำสองรอบ
 */
export function MaterialThumb({
  id,
  emoji,
  size = "h-11 w-11",
  rounded = "rounded-xl",
}: {
  id: string;
  emoji?: string | null;
  size?: string;
  rounded?: string;
}) {
  const src = MATERIAL_PHOTO[id];

  if (!src) {
    return (
      <span className={`flex ${size} shrink-0 items-center justify-center ${rounded} bg-neutral-100 text-lg`}>
        {emoji ?? "♻️"}
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${size} shrink-0 overflow-hidden ${rounded} bg-neutral-100 ring-1 ring-neutral-900/5`}>
      <Image src={src} alt="" aria-hidden fill sizes="48px" className="object-cover" />
    </span>
  );
}
