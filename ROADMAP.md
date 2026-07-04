# ROADMAP — Recycle Fund (แผน MVP แยกตาม Feature)

> อัปเดต: 2026-07-04 · ต่อยอดจาก [PLAN.md](PLAN.md)
> Priority: **P0** = ต้องมีใน MVP · P1 = รอบถัดไป · P2 = อนาคต
> Effort: **S** ≤1 วัน · **M** 2–4 วัน · **L** 1–2 สัปดาห์

---

## 0) ภาพรวม 3 หน้าจอ (Surfaces)

| Surface | ใคร | รูปแบบ | สถานะ |
|---|---|---|---|
| **A. Mobile PWA** | ผู้ขาย (ใน LINE) + คนขับ (ภาคสนาม) | มือถือ (มีแล้ว) | ✅ ~90% |
| **B. Back-office ร้านรับซื้อ** | ร้าน/คนขับ (โต๊ะทำงาน) | Full web (desktop) | ✅ MVP เดโมเสร็จ (localStorage) |
| **C. Admin Console** | เจ้าของระบบ (platform) | Full web (desktop) | ✅ MVP เดโมเสร็จ (localStorage) |

> B และ C เป็น **เดสก์ท็อป** (ตาราง/ไซด์บาร์กว้าง) — แยก route group `/shop/*`, `/admin/*` ออกจาก app-shell มือถือ + gate ด้วย role

---

## 1) Data model ที่ต้องเพิ่ม

| ตาราง | ใช้กับ | ฟิลด์หลัก |
|---|---|---|
| `bills` | B | id, buyer_id, source(app_job/walk_in), job_id?, seller_name/phone, date, total, service_fee, net_paid, payment_method, status(paid/void) |
| `bill_items` | B | bill_id, material_id, name, unit, weight/qty, price_per_unit, subtotal |
| `expenses` | B | buyer_id, category(น้ำมัน/ค่าแรง/เช่า…), amount, date, note |
| `sales` (ขายออกโกดัง) | B | buyer_id, material_id, weight, price, date *(P1 — ไว้คำนวณกำไร)* |
| `payouts` | B/C | buyer_id, period, amount, status |
| `roles` | C | เพิ่ม role `admin` + KYC status ใน profiles |

---

## 2) Surface A — Mobile (ผู้ขาย + คนขับ) — ปรับเพิ่มเล็กน้อย

| Feature | Pri | Effort | สถานะ |
|---|---|---|---|
| ขั้นตอนเลือกของ "ข้ามได้" (ตกลงหน้างาน) | P0 | S | ✅ ทำแล้ว |
| ผู้ขายทำงานใน **LINE (LIFF)** — login อัตโนมัติ, rich menu | P1 | M | ต่อจาก backend LINE ที่มี |
| คนขับ: route optimization (จัดเส้นทางประหยัด) | P2 | L | ใช้ Google Directions/VRP |

---

## 3) Surface B — Back-office ร้านรับซื้อ (Full web)

### B1 · สร้างบิลรับซื้อ (บิลรับงาน)
| Feature | Pri | Effort |
|---|---|---|
| สร้างบิลใหม่: เลือกลูกค้าจาก **งานในแอป** หรือ **walk-in** (กรอกเอง) | P0 | M |
| เพิ่มรายการ: วัสดุ + **ชั่งน้ำหนัก** + ราคา/หน่วย → รวมยอดอัตโนมัติ | P0 | M |
| หักค่าบริการ + แสดง **ยอดจ่ายสุทธิให้ผู้ขาย** (reuse `fees.ts`) | P0 | S |
| บันทึกบิล → ปิดงานในแอป (ถ้ามาจาก job) + ออกสิทธิ์รางวัล | P0 | M |
| พิมพ์ / ออก **PDF บิล** + เลขบิล/QR | P1 | M |
| แก้ไข/ยกเลิกบิล (void) + audit log | P1 | S |

### B2 · คลังวัสดุ & ราคารับซื้อ
| Feature | Pri | Effort |
|---|---|---|
| จัดการรายการวัสดุ + ราคาของร้าน (reuse `buyerPrices`) | P0 | S |
| หน่วย กก./ชิ้น/ใบ, ราคาตามเกรด | P1 | S |
| สต๊อกคงคลัง (รับเข้า–ขายออก) | P2 | L |

### B3 · บัญชี (รายรับ–รายจ่าย)
| Feature | Pri | Effort |
|---|---|---|
| สรุปรายรับจากบิล: ยอดรับซื้อ / ค่าบริการ / จ่ายผู้ขาย (รายวัน–เดือน) | P0 | M |
| บันทึก **รายจ่าย** (น้ำมัน/ค่าแรง/ค่าเช่า…) | P0 | M |
| **กำไรขั้นต้น** = ขายออก − ต้นทุนรับเข้า − ค่าใช้จ่าย | P1 | M |
| Payout: ยอดค้างจ่ายผู้ขาย / จ่ายแล้ว | P1 | M |
| ส่งออก Excel/CSV + ปิดงบรายเดือน | P1 | S |

### B4 · Dashboard & รายงานร้าน
| Feature | Pri | Effort |
|---|---|---|
| ยอดวันนี้ · จำนวนบิล · กราฟรายวัน | P0 | M |
| รายงานตามวัสดุ / ช่วงเวลา | P1 | M |

---

## 4) Surface C — Admin Console (Full web) — เจ้าของระบบ

### C1 · จัดการผู้ซื้อทุกคน
| Feature | Pri | Effort |
|---|---|---|
| รายชื่อผู้ซื้อทั้งหมด + ค้นหา/กรอง/สถานะ | P0 | S |
| อนุมัติ / ระงับบัญชี (KYC เบา: บัตร ปชช./รูป) | P0 | M |
| โปรไฟล์ + สถิติต่อผู้ซื้อ (จำนวนงาน/รายได้) | P0 | S |

### C2 · Dashboard รายได้รวม (ผู้ซื้อทุกคน)
| Feature | Pri | Effort |
|---|---|---|
| GMV รวม + **ค่าคอม platform** รวม | P0 | M |
| แยกตามผู้ซื้อ / เดือน / พื้นที่ | P0 | M |
| กราฟเทรนด์ + Top ผู้ซื้อ | P1 | M |

### C3 · จัดการราคากลาง
| Feature | Pri | Effort |
|---|---|---|
| แก้ราคากลางวัสดุ (ที่ผู้ขายเห็นบนหน้าแรก) | P0 | S |

### C4 · จัดการ & ประกาศรางวัล
| Feature | Pri | Effort |
|---|---|---|
| ดูสิทธิ์ทั้งหมด/เดือน + จำนวนรวม | P0 | S |
| **สุ่มเลขแบบพิสูจน์ได้** (ผูกหวยรัฐ / commit-reveal hash) 🔒 | P0 | M |
| ตั้งรางวัล/มูลค่า + ประกาศผล | P0 | M |
| **แจ้งผู้ชนะ + ผู้ขายทุกคน ผ่าน LINE push** (reuse API) | P0 | M |
| ประวัติการออกรางวัล + audit log | P1 | S |

---

## 5) Foundation ที่ต้องทำก่อน (ขวางทุกอย่างที่เกี่ยวกับเงิน/แอดมิน)

| Feature | Pri | Effort |
|---|---|---|
| ต่อ **Supabase จริง** + migrate data layer (store → server) | P0 | L |
| Auth server-side + **role** (seller/buyer/admin) + RLS | P0 | M |
| ออกสิทธิ์รางวัล/บิล **ฝั่ง server เท่านั้น** (กัน fraud) | P0 | M |
| ระบบจ่ายเงิน PromptPay/โอน + reconcile | P1 | L |

---

## 6) ลำดับการทำ (Phases)

| Phase | โฟกัส | รวม |
|---|---|---|
| **P1 · Foundation** | Supabase + auth roles + migrate store + ออกสิทธิ์/บิล server-side | ~1–2 สัปดาห์ |
| **P2 · ร้านรับซื้อ MVP** | B1 บิล → B2 ราคา → B3 บัญชีพื้นฐาน → B4 dashboard | ~2 สัปดาห์ |
| **P3 · Admin MVP** | C1 จัดการผู้ซื้อ → C2 รายได้รวม → C4 รางวัล(พิสูจน์ได้)+แจ้ง LINE → C3 ราคากลาง | ~1.5 สัปดาห์ |
| **P4 · ต่อยอด** | LINE LIFF, PromptPay, route optimization, สต๊อก, กำไรขั้นต้น | ~2–3 สัปดาห์ |

> **เดโมได้ก่อนขายจริง:** ถ้าอยากพรีเซนต์ B/C เร็ว ทำบน data layer localStorage เดิมได้ (เหมือน A) แล้วค่อยย้าย Supabase ใน P1 — เลือกได้ว่าจะ "เดโมก่อน" หรือ "backend จริงก่อน"
