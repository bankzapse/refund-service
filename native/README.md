# ถุงเขียว — Native App (Capacitor)

แอป iOS/Android แบบ **WebView (Capacitor)** ที่โหลดเว็บ production (บน Vercel) มาแสดง — โค้ดเว็บชุดเดียวใช้ทั้ง เว็บ + iOS + Android ไม่ต้องเขียนแอปแยก 2 แพลตฟอร์ม

โฟลเดอร์นี้เป็น **โปรเจกต์ Capacitor จริงที่รันได้** — มี `package.json`, config, icon/splash source, และปลั๊กอิน native (กล้องสแกน QR, status bar, back button) ครบ เหลือแค่รัน `cap add ios/android` บนเครื่อง Mac

---

## เริ่มเร็ว (bootstrap อัตโนมัติ)
```bash
cd native
bash setup.sh
```
สคริปต์จะ `npm install` → generate icon/splash → `cap add ios` + `cap add android` → `cap sync` แล้วบอกขั้นตอนต่อ

## เริ่มแบบ manual
```bash
cd native
npm install
npm run assets            # generate icon/splash จาก resources/logo.svg
npm run add:ios           # ต้องมี Xcode + CocoaPods
npm run add:android       # ต้องมี Android Studio + JDK 17
npm run sync
npm run open:ios          # หรือ npm run open:android
```

> `ios/` และ `android/` เป็นโปรเจกต์ที่ generate ขึ้นมา (อยู่ใน .gitignore) — สร้างใหม่ได้เสมอด้วย `cap add`

---

## โครงไฟล์
| ไฟล์ | หน้าที่ |
|---|---|
| `capacitor.config.ts` | ตั้ง `appId`, `server.url` (โดเมน production), splash/status bar |
| `package.json` | deps + สคริปต์ (`sync`, `add:ios`, `open:ios`, `assets`, …) |
| `resources/logo.svg` · `resources/splash.svg` | ต้นฉบับ icon + splash → `npm run assets` |
| `public/index.html` | placeholder (แอปจริงโหลดจาก `server.url`) |
| `setup.sh` | bootstrap ครบขั้นตอน |

## ตั้งค่าก่อน build จริง
1. **โดเมน**: แก้ `server.url` ใน `capacitor.config.ts` เป็นโดเมน production (เช่น `https://app.thungkhiao.co`) แล้ว `npm run sync`
2. **Bundle id / package**: `co.thungkhiao.app` — จองให้ตรงกันทั้ง App Store + Play (แก้ที่ `appId`)
3. **Icon/Splash**: แก้ `resources/logo.svg` (หรือวาง `resources/logo.png` 1024×1024) แล้ว `npm run assets`

---

## กล้อง / สแกน QR (native)
ในแอป native ใช้ `@capacitor-mlkit/barcode-scanning` (กล้องจริง) — โค้ดเว็บเชื่อมให้แล้วที่
[`src/lib/native.ts`](../src/lib/native.ts) → `nativeScanQr()` และหน้า `drop` เรียกใช้เมื่อ `isNativeApp()`
(ในเว็บ/LINE ยังใช้ `liff.scanCodeV2()` เหมือนเดิม — ตรวจอัตโนมัติ)

ต้องประกาศ permission กล้องในโปรเจกต์ native:

**iOS** — `ios/App/App/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>ใช้กล้องเพื่อสแกน QR บนถุงและตู้ Drop &amp; Go</string>
```

**Android** — `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```
(MLKit บน Android ดึงโมดูลสแกนจาก Google Play ครั้งแรกอัตโนมัติ — โค้ดใน `native.ts` เรียก `installGoogleBarcodeScannerModule` ให้แล้ว)

## Deep link / Universal Link (ทีหลัง)
ให้ลิงก์ `https://app.thungkhiao.co/...` เปิดในแอป: ตั้ง Associated Domains (iOS) + App Links (Android) ชี้โดเมนเดียวกับ `server.url`

## Push notification (ทีหลัง)
`@capacitor/push-notifications` + FCM (Android) / APNs (iOS) แจ้งเตือนคะแนนเข้า/แลกเงินอนุมัติ
หรือใช้ LINE Messaging API สำหรับผู้ใช้ที่เชื่อม LINE (ฟรี, คนไทยเปิดอ่านสูง)

---

## เตรียมส่ง store (checklist)

### Apple App Store
- [ ] Apple Developer Program ($99/ปี)
- [ ] Bundle id `co.thungkhiao.app` ใน App Store Connect
- [ ] Icon 1024×1024 (จาก `npm run assets`)
- [ ] Screenshots 6.7" + 6.5" (iPhone)
- [ ] `NSCameraUsageDescription` (ข้างบน) — **ถ้าขาด รีวิวปฏิเสธ**
- [ ] Privacy Policy URL: `https://<โดเมน>/privacy`
- [ ] App Privacy form: ดู [`../STORE_PRIVACY.md`](../STORE_PRIVACY.md) ส่วน B
- [ ] Account deletion: in-app (แท็บคะแนน → ลบบัญชี) + URL `https://<โดเมน>/delete-account` → ใส่ใน review notes
- [ ] **4.2 (Minimum Functionality)**: เน้นว่าแอปมี native value — สแกน QR ด้วยกล้อง native, สะสม/แลกแต้มเป็นเงินจริง (ไม่ใช่แค่ห่อเว็บ) → ผ่านรีวิว
- [ ] Archive ใน Xcode → upload → TestFlight → Submit

### Google Play
- [ ] Play Console ($25 ครั้งเดียว)
- [ ] Package `co.thungkhiao.app`
- [ ] Icon 512×512 + Feature graphic 1024×500
- [ ] Screenshots (โทรศัพท์)
- [ ] Data safety form: ดู [`../STORE_PRIVACY.md`](../STORE_PRIVACY.md) ส่วน A
- [ ] Privacy Policy URL + Account deletion URL (`/delete-account`)
- [ ] Build `.aab` (Android Studio → Generate Signed Bundle) → upload → Internal testing → Production

---

## Push Notification (Capacitor + FCM)
โค้ดต่อไว้แล้ว: `src/lib/native.ts → registerPush()` (เรียกอัตโนมัติใน `initNativeApp`) ·
เก็บ token ที่ `POST /api/push/register` · ส่งจากเซิร์ฟเวอร์ด้วย `src/lib/push.ts → sendToUser()` (FCM HTTP v1)

### ต้องตั้งค่า (ครั้งเดียว)
1. **Firebase project** (console.firebase.google.com) — สร้าง/ใช้โปรเจกต์เดียวกับที่จะใช้ FCM
2. **Android**: เพิ่มแอป Android (package `co.thungkhiao.app`) → ดาวน์โหลด **`google-services.json`** → วางที่ `native/android/app/google-services.json` → `npm run sync`
3. **iOS (APNs)**:
   - เพิ่มแอป iOS ใน Firebase (bundle `co.thungkhiao.app`) → ดาวน์โหลด **`GoogleService-Info.plist`** → วางใน `native/ios/App/App/`
   - Apple Developer → สร้าง **APNs Auth Key (.p8)** → อัปโหลดใน Firebase → Project Settings → Cloud Messaging → Apple app configuration
   - Xcode → target App → Signing & Capabilities → **+ Push Notifications** + **Background Modes → Remote notifications**
4. **Server (Vercel env)**: Firebase → Project Settings → **Service accounts → Generate new private key** → เอาเนื้อ JSON ทั้งก้อนใส่ env **`FCM_SERVICE_ACCOUNT_JSON`**
5. รัน migration `supabase/migrations/20260709000002_device_tokens.sql` (หรือ schema.sql มีให้แล้ว)

### ทดสอบ
เปิดแอป native (ล็อกอินแล้ว) → อนุญาตแจ้งเตือน → เรียก `POST /api/push/test` (เช่น จาก devtools) → ควรได้ push "ทดสอบการแจ้งเตือน 🎉"

### ส่งอัตโนมัติตอนมีเหตุการณ์ (ต่อไว้แล้ว → `POST /api/push/hook`)
ตั้ง **Supabase Database Webhook** 2 ตัว (Database → Webhooks → Create) ชี้มาที่
`https://<domain>/api/push/hook` + เพิ่ม HTTP header **`x-webhook-secret`** = ค่า env **`PUSH_HOOK_SECRET`**:

| Webhook | Table | Events | ผล |
|---|---|---|---|
| ได้รับคะแนน | `point_transactions` | **Insert** | แจ้งผู้ขาย "ได้รับ X คะแนน" (เฉพาะ type=earn) |
| เงินโอนแล้ว | `redemptions` | **Update** | แจ้งผู้ขาย "โอนเงิน ฿X แล้ว" (เมื่อ status→paid) |

> endpoint กันปลอมด้วย `x-webhook-secret` · ถ้าไม่ตั้ง `FCM_SERVICE_ACCOUNT_JSON` จะข้ามเงียบ ๆ (ไม่พัง)
