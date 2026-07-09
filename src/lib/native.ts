/**
 * Native bridge (Capacitor) — ใช้เมื่อเว็บถูกห่อเป็นแอป iOS/Android ด้วย Capacitor
 *
 * สำคัญ: ไฟล์นี้ "ไม่ import" แพ็กเกจ @capacitor/* เลย — อ่านผ่าน global `window.Capacitor`
 * ที่ native runtime inject ให้ตอนรันในแอปเท่านั้น เพื่อให้ build เว็บ (Vercel) ไม่ต้องมี dep พวกนี้
 * บนเว็บ/LINE ปกติ ทุกฟังก์ชันจะ no-op / คืน false อย่างปลอดภัย
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: Record<string, any>;
}
declare global {
  interface Window {
    Capacitor?: CapacitorGlobal;
  }
}

function cap(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  return window.Capacitor ?? null;
}

/** true เมื่อรันอยู่ในแอป native (Capacitor iOS/Android) */
export function isNativeApp(): boolean {
  return Boolean(cap()?.isNativePlatform?.());
}

/** 'ios' | 'android' | 'web' */
export function nativePlatform(): string {
  return cap()?.getPlatform?.() ?? "web";
}

function plugin(name: string): any | null {
  return cap()?.Plugins?.[name] ?? null;
}

/**
 * สแกน QR/บาร์โค้ดด้วยกล้อง native (@capacitor-mlkit/barcode-scanning)
 * คืนสตริงที่อ่านได้ หรือ null (ยกเลิก/ไม่มีสิทธิ์/ไม่รองรับ) → ให้ผู้ใช้กรอกเอง
 * ใช้ได้เฉพาะในแอป native เท่านั้น (ในเว็บ/LINE ให้ใช้ liff.scanQr แทน)
 */
export async function nativeScanQr(): Promise<string | null> {
  const BS = plugin("BarcodeScanner");
  if (!BS) return null;
  try {
    // Android: โหลดโมดูล MLKit จาก Google Play ครั้งแรก (no-op บน iOS)
    if (typeof BS.isGoogleBarcodeScannerModuleAvailable === "function") {
      const { available } = await BS.isGoogleBarcodeScannerModuleAvailable();
      if (!available && typeof BS.installGoogleBarcodeScannerModule === "function") {
        await BS.installGoogleBarcodeScannerModule().catch(() => {});
      }
    }
    if (typeof BS.requestPermissions === "function") {
      const perm = await BS.requestPermissions();
      if (perm?.camera !== "granted" && perm?.camera !== "limited") return null;
    }
    const res = await BS.scan();
    const codes = res?.barcodes ?? [];
    return codes[0]?.rawValue ?? codes[0]?.displayValue ?? null;
  } catch {
    return null;
  }
}

/** เปิดลิงก์ภายนอกในเบราว์เซอร์ระบบ (แทนที่จะเปิดในหน้าแอป) */
async function openExternal(url: string) {
  const Browser = plugin("Browser");
  if (Browser?.open) {
    await Browser.open({ url }).catch(() => {});
  } else {
    window.open(url, "_blank");
  }
}

/**
 * ลงทะเบียนรับ Push Notification (@capacitor/push-notifications)
 * ขอสิทธิ์ → register → ได้ token (FCM/APNs) → ส่งไปเก็บที่ /api/push/register (ผูกกับ user ที่ล็อกอิน)
 * ใช้ได้เฉพาะแอป native · บนเว็บ = no-op
 */
export async function registerPush(): Promise<void> {
  const PN = plugin("PushNotifications");
  if (!PN) return;
  try {
    let perm = await PN.checkPermissions?.();
    if (perm?.receive !== "granted") perm = await PN.requestPermissions?.();
    if (perm?.receive !== "granted") return;

    PN.addListener?.("registration", async (t: { value: string }) => {
      try {
        await fetch("/api/push/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t.value, platform: nativePlatform() }),
        });
      } catch {
        /* ผู้ใช้ยังไม่ล็อกอิน/เน็ตหลุด — ข้ามไป */
      }
    });
    PN.addListener?.("registrationError", () => {});
    await PN.register?.();
  } catch {
    /* ignore */
  }
}

let initialized = false;

/**
 * ตั้งค่าแอป native ตอนเริ่ม — เรียกครั้งเดียวจาก NativeBootstrap
 * - ซ่อน splash screen เมื่อเว็บพร้อม
 * - ปุ่ม back ฮาร์ดแวร์ (Android): ย้อนถ้าย้อนได้ ไม่งั้นออกแอป
 * - เปิดลิงก์ภายนอก (คนละโดเมน / target=_blank) ในเบราว์เซอร์ระบบ
 */
export function initNativeApp(): void {
  const C = cap();
  if (!C?.isNativePlatform?.() || initialized) return;
  initialized = true;
  const P = C.Plugins ?? {};

  P.SplashScreen?.hide?.();
  P.StatusBar?.setStyle?.({ style: "LIGHT" }); // header เขียว/ขาว → ให้ status bar อ่านง่าย

  // ลงทะเบียน push (ถ้าล็อกอินแล้ว token จะผูกกับ user) — เรียกซ้ำได้หลังล็อกอินด้วย
  registerPush();

  // ปุ่ม back ฮาร์ดแวร์ (Android)
  P.App?.addListener?.("backButton", (info: { canGoBack?: boolean }) => {
    if (info?.canGoBack) window.history.back();
    else P.App?.exitApp?.();
  });

  // ลิงก์ภายนอก → เบราว์เซอร์ระบบ (ไม่ให้ webview หลงออกนอกแอป)
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (!/^https?:\/\//i.test(href)) return;
      const sameOrigin = href.startsWith(window.location.origin);
      if (!sameOrigin || a.target === "_blank") {
        e.preventDefault();
        openExternal(href);
      }
    },
    true
  );
}
