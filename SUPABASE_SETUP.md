# Supabase Foundation — วิธีเปิดใช้ Backend จริง (Phase 1)

> เดโมรันบน localStorage ได้เลยโดยไม่ต้องทำขั้นตอนนี้
> ทำตามนี้เมื่อพร้อมขึ้น production จริง · โครงพร้อมแล้ว เหลือใส่ค่า + ย้าย logic ทีละส่วน

## สิ่งที่เตรียมไว้ให้แล้ว
```
supabase/schema.sql            ตาราง + RLS + secure functions (settle_bill / draw_reward_winner / set_user_status)
src/lib/supabase/client.ts     client ฝั่ง browser
src/lib/supabase/server.ts     client ฝั่ง server (RSC/route)
src/lib/supabase/middleware.ts รีเฟรช session (guarded — ข้ามถ้าไม่มี env)
src/middleware.ts              เรียก updateSession ทุก request
src/lib/supabase/queries.ts    data seam: fetchProfile/fetchCentralPrices/settleBill/drawWinner/setUserStatus
src/lib/otp.ts + /api/otp/*    OTP ของแอปเอง (HMAC ไร้สถานะ → SMS OK) ใช้ทั้งสมัคร/ลืมรหัสผ่าน
/api/auth/register             สมัครผู้ขาย: ยืนยัน OTP ฝั่ง server → สร้างบัญชีด้วย service-role
```

---

## ขั้นตอนเปิดใช้

### 1) สร้างโปรเจกต์
- ไปที่ [supabase.com](https://supabase.com) → New project → เก็บ **Project URL**, **anon key**, **service_role key**

### 2) รัน schema
- **โปรเจกต์ใหม่:** Dashboard → **SQL Editor** → วางทั้งไฟล์ [`supabase/schema.sql`](supabase/schema.sql) → Run (schema.sql รวมโมเดลเครดิตไว้แล้ว)
- ได้ตาราง + RLS + function + อัตราเลทโรงงานเริ่มต้น

> **โปรเจกต์เดิม (มี schema เก่าอยู่แล้ว)** — อย่ารัน schema.sql ซ้ำ ให้รัน migration ตามลำดับแทน (ไม่ลบข้อมูล, รันซ้ำได้):
> 1. [`20260705000001_credit_partner_model.sql`](supabase/migrations/20260705000001_credit_partner_model.sql) — `profiles.credit/partner` + `wallet_transactions` + `settle_bill` (ค่าคอม 2% หักเครดิต, gate ≥ 300) + `adjust_credit`/`topup_credit`
> 2. [`20260705000002_drop_and_go.sql`](supabase/migrations/20260705000002_drop_and_go.sql) — `profiles.points` + ตาราง `cabinets`/`mesh_bags`/`bag_items`/`point_transactions`/`redemptions` + RLS + RPC `drop_bags`/`value_bag`/`redeem_points`/`set_redemption_status`/`add_cabinet` (คะแนน = มูลค่า × 10)
>
> ผู้รับซื้อเดิมเริ่มด้วยเครดิต 0 · คนทิ้งเริ่มคะแนน 0

> **Drop & Go — QR scanner ในไลน์:** เปิด LINE Developers Console → LIFF app → เพิ่ม scope **`scanQRCode`** (ไม่งั้น `liff.scanCodeV2()` จะถูกปิด แอปจะ fallback ให้กรอกรหัสเอง)

### 3) ใส่ env (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ใช้ฝั่ง server เท่านั้น
```
> พอมี 2 ตัวแรก middleware จะเริ่มจัดการ session อัตโนมัติ (ไม่มี = โหมดเดโมเหมือนเดิม)

### 4) เปิด Auth providers (Dashboard → Authentication)
- **Email** — เปิด (Confirm email ปิดได้ตอนเดฟ)
- **Phone** — เปิด + ต่อ SMS provider (Twilio ฯลฯ) สำหรับ OTP เบอร์โทร

### 5) Type-safe + Role protection (✅ ทำไว้แล้ว)
- [`database.types.ts`](src/lib/supabase/database.types.ts) เขียนตรง schema + ผูก generic `createClient<Database>` แล้ว (client/server/middleware type-safe)
- **แนะนำ regenerate ให้ตรงเป๊ะหลังแก้ schema:**
  ```bash
  npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
  ```
- **Middleware ป้องกัน route ตาม role** ([`middleware.ts`](src/lib/supabase/middleware.ts)) ทำงานอัตโนมัติเมื่อมี key:
  - `/admin/*` → admin เท่านั้น · `/shop/*` → buyer เท่านั้น · แอดมินถูกส่งไป `/admin` · ยังไม่ล็อกอิน → `/login`
  - role อ่านจาก `user_metadata.role` (ตั้งตอนสมัคร) — เป็นด่านฝั่ง server เสริม layout ฝั่ง client

---

## แผนย้าย logic (store.tsx → Supabase) ทีละส่วน
ทำทีละขั้น ทดสอบทีละขั้น (ตัวเดโมยังใช้ได้ระหว่างทาง):

1. ✅ **Auth (เสร็จแล้ว)** — login/register แยกอัตโนมัติตาม `supabaseConfigured`:
   - มี key → ใช้ Supabase Auth จริง (อีเมล/รหัสผ่าน + เบอร์ OTP), store ดึง user จาก session (`onAuthStateChange`), logout = `signOut()`
   - ไม่มี key → เดโม localStorage เหมือนเดิม
   - มี `/auth/callback` สำหรับยืนยันอีเมล · แค่ใส่ key + เปิด provider ก็ใช้ได้ทันที
2. ✅ **Reads (เสร็จแล้ว)** — [`repo.loadAll()`](src/lib/supabase/repo.ts) โหลดทุกตาราง → map เป็นรูป `db` เดิม → selectors/components ทำงานเหมือนเดิมไม่ต้องแก้ (RLS คัดกรองข้อมูล)
3. ✅ **Writes ทั่วไป (เสร็จแล้ว)** — createJob/addSlot/setBuyerPrice/expense ฯลฯ → `supabase.from(...).insert/update` (branch อัตโนมัติใน `store.tsx`)
4. ✅ **Writes ปลอดภัย (เสร็จแล้ว)** — ปิดงาน/ออกบิล/สิทธิ์ (`settle_bill`) · สุ่มรางวัล (`draw_reward_winner`) · ระงับ (`set_user_status`) → **RPC เท่านั้น** · client แก้ตรง ๆ ไม่ได้
5. ✅ **Realtime (เสร็จแล้ว)** — subscribe `postgres_changes` → refresh `db` อัตโนมัติเมื่อข้อมูลเปลี่ยน
6. ลบ `store.tsx` (localStorage) เมื่อย้ายครบ / ทดสอบกับ project จริงเรียบร้อย

## ความปลอดภัยที่ schema บังคับไว้แล้ว (จาก audit)
- ✅ สิทธิ์รางวัล/บิล mint จาก **function ฝั่ง server** เท่านั้น (ไม่มี RLS insert ให้ client → ปลอมไม่ได้)
- ✅ ปิดงานตรวจว่าเป็น buyer ตัวจริง + สถานะงานถูกต้อง (atomic)
- ✅ เพดานสิทธิ์/บิล + /เดือน กันฟาร์ม
- ✅ สุ่มรางวัล/ระงับบัญชี เฉพาะ admin (`is_admin()`)
- ⚠️ ต่อยอด: ผูกเลขรางวัลกับหวยรัฐ/commit-reveal · จ่ายเงิน PromptPay · KYC

---

## LINE LIFF — ผู้ขายเปิดแอปในไลน์ (✅ ทำไว้แล้ว)
โค้ดพร้อม เปิดใช้แค่ใส่ LIFF ID:
1. [LINE Developers Console](https://developers.line.biz) → LINE Login channel → แท็บ **LIFF** → Add
   - Endpoint URL = โดเมนแอป (เช่น `https://your-app.vercel.app`) · Scope: `profile openid`
2. คัดลอก **LIFF ID** → ใส่ `.env.local`:
   ```bash
   NEXT_PUBLIC_LIFF_ID=1234567890-abcdefgh
   ```
3. เมื่อเปิดผ่านลิงก์ LIFF ในไลน์ → **auto-login ด้วยบัญชี LINE** อัตโนมัติ ([liff.ts](src/lib/liff.ts))
   - เดโม: สร้าง/หาผู้ใช้ (role ผู้ขาย) จาก LINE userId
   - ✅ **production (Supabase): ทำ token exchange แล้ว** — [`/api/line/liff-login`](src/app/api/line/liff-login/route.ts) verify LIFF token กับ LINE → หา/สร้างผู้ใช้ (ผูก `line_user_id`) → คืน magic-link OTP → client แลกเป็น session · ต้องตั้ง **`SUPABASE_SERVICE_ROLE_KEY`** (server เท่านั้น)
- ไม่มี LIFF ID = เว็บปกติ (มีปุ่ม/เข้าเดโมเหมือนเดิม)

## Deploy
Vercel → import repo → ตั้ง env ตามข้อ 3 → เพิ่ม redirect URL ของ Supabase Auth เป็นโดเมน production
