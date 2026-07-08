/**
 * LINE LIFF — ให้ผู้ขายเปิดแอปในไลน์ + auto-login ด้วยบัญชี LINE
 * เปิดใช้เมื่อตั้ง NEXT_PUBLIC_LIFF_ID (ไม่มี = โหมดเดโม/เว็บปกติ)
 * ใช้ dynamic import กัน SSR แตะ window
 */
export const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
export const liffConfigured = Boolean(liffId);

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ready: Promise<any> | null = null;

async function initLiff() {
  if (!liffConfigured || typeof window === "undefined") return null;
  if (!ready) {
    ready = import("@line/liff").then(async (mod) => {
      const liff = mod.default;
      await liff.init({ liffId: liffId! });
      return liff;
    });
  }
  return ready;
}

/** คืนโปรไฟล์ LINE (auto-login ถ้ายังไม่ล็อกอิน → redirect ไป LINE) */
export async function getLineProfile(): Promise<LineProfile | null> {
  const liff = await initLiff();
  if (!liff) return null;
  if (!liff.isLoggedIn()) {
    liff.login();
    return null; // กำลัง redirect
  }
  const p = await liff.getProfile();
  return { userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl };
}

/** access token ของ LIFF (ส่งไป verify + แลก Supabase session ฝั่ง server) */
export async function getLiffAccessToken(): Promise<string | null> {
  const liff = await initLiff();
  if (!liff) return null;
  if (!liff.isLoggedIn()) {
    liff.login();
    return null;
  }
  return liff.getAccessToken();
}

export async function isInLineClient(): Promise<boolean> {
  const liff = await initLiff();
  return liff ? liff.isInClient() : false;
}

/**
 * สแกน QR ด้วยกล้องในไลน์ (liff.scanCodeV2) — คืนสตริงที่อ่านได้ หรือ null
 * ใช้ได้เมื่อเปิดผ่าน LINE + เปิดฟีเจอร์ scanQRCode ใน LINE Developers Console
 * null = สแกนไม่ได้/ยกเลิก → ให้ผู้ใช้กรอกเอง
 */
export async function scanQr(): Promise<string | null> {
  const liff = await initLiff();
  if (!liff || typeof liff.scanCodeV2 !== "function") return null;
  try {
    const res = await liff.scanCodeV2();
    return res?.value ?? null;
  } catch {
    return null;
  }
}

/** ปิดหน้าต่าง LIFF (เมื่ออยู่ในไลน์) */
export async function closeLiff() {
  const liff = await initLiff();
  if (liff && liff.isInClient()) liff.closeWindow();
}
