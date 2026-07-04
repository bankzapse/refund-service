/** รัศมีค้นหางานของคนขับ (กม.) */
export const RADIUS_KM = 30;

/** ตำแหน่งฐานเริ่มต้น (กลางกรุงเทพฯ) เมื่อคนขับยังไม่ตั้งตำแหน่ง */
export const DEFAULT_BASE = { lat: 13.7563, lng: 100.5018 };

/** ระยะทางแบบ haversine (กม.) */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} ม.`;
  return `${km.toFixed(1)} กม.`;
}
