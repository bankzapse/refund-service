#!/usr/bin/env node
/**
 * สร้างรูป Rich Menu (2500×1686) จาก SVG → public/richmenu.png
 *
 *   node scripts/build-richmenu-image.mjs
 *
 * ต้องรันบนเครื่องที่มีฟอนต์ไทย (macOS มีอยู่แล้ว) — ผลลัพธ์เป็น PNG นิ่ง
 * commit ลง repo ได้เลย ไม่ต้องมีฟอนต์ตอน deploy
 *
 * พิกัดต้องตรงกับ RICH_MENU_AREAS ใน scripts/line-richmenu.mjs
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 2500;
const H = 1686;
// แถวบน 2 ช่องใหญ่ (งานที่ใช้บ่อยสุด) · แถวล่าง 3 ช่อง
const ROW_H = 843;
const TOP = [
  { x: 0, w: 1250 },
  { x: 1250, w: 1250 },
];
const BOTTOM = [
  { x: 0, w: 833 },
  { x: 833, w: 833 },
  { x: 1666, w: 834 },
];
const cellBox = (i) =>
  i < 2 ? { ...TOP[i], y: 0 } : { ...BOTTOM[i - 2], y: ROW_H };

// ไอคอนวาดด้วย path ล้วน (ไม่พึ่งฟอนต์ emoji ที่อาจไม่มีบนเครื่อง build)
const CELLS = [
  { label: "หย่อนถุง", sub: "สแกน QR บนถุง", icon: "scan", accent: "#16a34a" },
  { label: "คะแนน & แลกเงิน", sub: "ดูยอด · โอนพร้อมเพย์", icon: "coin", accent: "#0d9488" },
  { label: "สถานะถุง", sub: "ติดตามการคัดแยก", icon: "box", accent: "#0891b2" },
  { label: "หน้าแรก", sub: "ภาพรวมบัญชีของฉัน", icon: "home", accent: "#059669" },
  { label: "โปรไฟล์", sub: "บัญชี · ตั้งค่า", icon: "user", accent: "#475569" },
];

const ICONS = {
  scan: `<path d="M-34-34h20M-34-34v20M34-34H14M34-34v20M-34 34h20M-34 34v-20M34 34H14M34 34v-20" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/><rect x="-15" y="-15" width="30" height="30" rx="4" fill="#fff"/>`,
  coin: `<circle r="30" fill="none" stroke="#fff" stroke-width="7"/><path d="M0-15v30M-9-8h13a7 7 0 010 14h-13" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  box: `<path d="M-32-14l32-16 32 16v30l-32 16-32-16z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="M-32-14l32 16 32-16M0 2v30" stroke="#fff" stroke-width="6" fill="none"/>`,
  tag: `<path d="M-6-30h22a14 14 0 0114 14v22L-2 34a8 8 0 01-11 0l-21-21a8 8 0 010-11z" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><circle cx="12" cy="-12" r="6" fill="#fff"/>`,
  home: `<path d="M-32 -2L0-32l32 30" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M-23 4v28h46V4" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>`,
  user: `<circle cy="-12" r="16" fill="none" stroke="#fff" stroke-width="7"/><path d="M-26 34c0-16 12-26 26-26s26 10 26 26" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`,
};

const FONT = "IBM Plex Sans Thai, Noto Sans Thai, Thonburi, Sarabun, sans-serif";

/** escape ข้อความก่อนใส่ใน SVG — "&" ดิบทำให้ XML parse ไม่ผ่าน */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const cell = (i) => {
  const c = CELLS[i];
  const { x, y, w } = cellBox(i);
  const cx = x + w / 2;
  const cy = y + ROW_H / 2;
  return `
    <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${ROW_H - 12}" rx="28" fill="#ffffff"/>
    <circle cx="${cx}" cy="${cy - 100}" r="76" fill="${c.accent}"/>
    <g transform="translate(${cx} ${cy - 100})">${ICONS[c.icon]}</g>
    <text x="${cx}" y="${cy + 80}" font-family="${FONT}" font-size="74" font-weight="700"
          fill="#1f2937" text-anchor="middle">${esc(c.label)}</text>
    <text x="${cx}" y="${cy + 160}" font-family="${FONT}" font-size="46"
          fill="#9ca3af" text-anchor="middle">${esc(c.sub)}</text>`;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop stop-color="#22c55e"/><stop offset="1" stop-color="#15803d"/>
  </linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${CELLS.map((_, i) => cell(i)).join("")}
</svg>`;

const out = new URL("../public/richmenu.png", import.meta.url).pathname;
let buf = await sharp(Buffer.from(svg)).png({ quality: 90, compressionLevel: 9 }).toBuffer();

// LINE จำกัดไฟล์ไม่เกิน 1 MB — ถ้าเกินให้ลดเป็น JPEG คุณภาพสูง
if (buf.length > 1024 * 1024) {
  buf = await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer();
}
await writeFile(out, buf);
console.log(`สร้าง ${out} — ${(buf.length / 1024).toFixed(0)} KB (${W}×${H})`);
if (buf.length > 1024 * 1024) console.error("⚠️ ไฟล์ยังเกิน 1MB — LINE จะไม่รับ");
