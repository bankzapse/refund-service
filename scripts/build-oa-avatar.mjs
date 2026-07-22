#!/usr/bin/env node
/**
 * รูปโปรไฟล์ LINE Official Account → public/line-oa-avatar.png
 *
 *   node scripts/build-oa-avatar.mjs
 *
 * อัปโหลดที่: LINE OA Manager → ตั้งค่า → ข้อมูลบัญชี → รูปโปรไฟล์
 * ขนาดที่แนะนำ 640×640 · ไม่เกิน 3 MB · รองรับ jpg/jpeg/png
 *
 * ⚠️ LINE ครอปเป็น "วงกลม" — พื้นหลังจึงเต็มขอบ และ TK อยู่กลางเล็กพอ
 *    ให้อยู่ในวงกลมเสมอ (มุมทั้งสี่ถูกตัดทิ้งไม่มีผล)
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const S = 640;
const R = S / 2;
const FONT = "IBM Plex Sans Thai, Noto Sans Thai, Thonburi, Sarabun, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${S}" y2="${S}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#22c55e"/><stop offset="1" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <!-- เต็มสี่เหลี่ยม — ครอปวงกลมแล้วขอบยังเป็นสีแบรนด์ -->
  <rect width="${S}" height="${S}" fill="url(#g)"/>
  <!-- ลวดลายจาง ๆ ให้ไม่แบนเกินไป (อยู่ในวงกลม) -->
  <circle cx="${S * 0.78}" cy="${S * 0.24}" r="${S * 0.26}" fill="#ffffff" opacity="0.09"/>
  <circle cx="${S * 0.2}" cy="${S * 0.82}" r="${S * 0.22}" fill="#ffffff" opacity="0.07"/>
  <!-- TK — ขนาดพอให้อยู่ในวงกลมเสมอ -->
  <text x="${R}" y="${R + 76}" font-family="${FONT}" font-size="230" font-weight="700"
        fill="#ffffff" text-anchor="middle" letter-spacing="-10">TK</text>
</svg>`;

const out = new URL("../public/line-oa-avatar.png", import.meta.url).pathname;
const buf = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(out, buf);
console.log(`สร้าง ${out} — ${(buf.length / 1024).toFixed(0)} KB (${S}×${S})`);
console.log("อัปโหลดที่ LINE OA Manager → ตั้งค่า → ข้อมูลบัญชี → รูปโปรไฟล์");
