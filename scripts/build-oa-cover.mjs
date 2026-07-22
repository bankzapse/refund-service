#!/usr/bin/env node
/**
 * รูปพื้นหลัง (cover) ของ LINE Official Account → public/line-oa-cover.png
 *
 *   node scripts/build-oa-cover.mjs
 *
 * อัปโหลดที่: LINE OA Manager → ตั้งค่า → ข้อมูลบัญชี → รูปพื้นหลัง
 * ขนาดมาตรฐาน 1080×878 · ไม่เกิน 10MB
 *
 * ⚠️ พื้นที่ล่างซ้ายถูกรูปโปรไฟล์ + ชื่อบัญชีทับ — เว้นไว้ อย่าวางข้อความสำคัญ
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 1080;
const H = 878;
const SAFE_BOTTOM = 260; // แถบล่างที่ LINE เอารูปโปรไฟล์/ชื่อมาทับ

const FONT = "IBM Plex Sans Thai, Noto Sans Thai, Thonburi, Sarabun, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CY = (H - SAFE_BOTTOM) / 2; // กึ่งกลางของพื้นที่ที่ใช้ได้จริง

/** ไอคอนรีไซเคิลแบบลูกศรสามเหลี่ยม วาดด้วย path ไม่พึ่งฟอนต์ */
const leaf = (x, y, s, o) => `
  <g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">
    <path d="M0-26 L22 12 L-22 12 Z" fill="none" stroke="#ffffff" stroke-width="7" stroke-linejoin="round"/>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#22c55e"/><stop offset="0.55" stop-color="#16a34a"/><stop offset="1" stop-color="#14532d"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- ลวดลายจาง ๆ -->
  <circle cx="${W - 90}" cy="120" r="230" fill="#ffffff" opacity="0.07"/>
  <circle cx="70" cy="${H - 120}" r="190" fill="#ffffff" opacity="0.06"/>
  ${leaf(120, 150, 1.6, 0.13)}
  ${leaf(W - 170, H - 300, 2.0, 0.11)}
  ${leaf(W - 340, 200, 1.1, 0.1)}

  <!-- โลโก้ TK -->
  <g transform="translate(${W / 2 - 66} ${CY - 235})">
    <rect width="132" height="132" rx="34" fill="#ffffff"/>
    <text x="66" y="90" font-family="${FONT}" font-size="62" font-weight="700"
          fill="#16a34a" text-anchor="middle" letter-spacing="-2">TK</text>
  </g>

  <text x="${W / 2}" y="${CY + 50}" font-family="${FONT}" font-size="104" font-weight="700"
        fill="#ffffff" text-anchor="middle">ถุงเขียว</text>

  <text x="${W / 2}" y="${CY + 122}" font-family="${FONT}" font-size="42"
        fill="#ffffff" opacity="0.93" text-anchor="middle">${esc("เปลี่ยนขยะรีไซเคิลให้เป็นเงินจริง")}</text>

  <!-- 3 ขั้นตอน -->
  <g font-family="${FONT}" font-size="34" fill="#ffffff" opacity="0.9" text-anchor="middle">
    <rect x="${W / 2 - 400}" y="${CY + 165}" width="800" height="74" rx="37" fill="#ffffff" opacity="0.16"/>
    <text x="${W / 2}" y="${CY + 213}">${esc("หย่อนถุงที่ตู้ · สแกน QR · สะสมแต้ม · แลกเป็นเงิน")}</text>
  </g>
</svg>`;

const out = new URL("../public/line-oa-cover.png", import.meta.url).pathname;
const buf = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(out, buf);
console.log(`สร้าง ${out} — ${(buf.length / 1024).toFixed(0)} KB (${W}×${H})`);
console.log("อัปโหลดที่ LINE OA Manager → ตั้งค่า → ข้อมูลบัญชี → รูปพื้นหลัง");
