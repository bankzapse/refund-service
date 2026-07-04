import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LatLng = { lat: number; lng: number };

/**
 * POST /api/route/matrix  { points: [{lat,lng}] }  (จุดแรก = ฐาน)
 * คืน distance/duration matrix จริงจาก Google Distance Matrix
 * ไม่มี GOOGLE_MAPS_API_KEY → { distances: null } (client fallback เป็น haversine)
 */
export async function POST(req: Request) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const body = await req.json().catch(() => ({}));
  const points: LatLng[] = body?.points;

  if (!key) return NextResponse.json({ distances: null, reason: "no_key" });
  if (!Array.isArray(points) || points.length < 2 || points.length > 25) {
    return NextResponse.json({ distances: null, reason: "bad_points" });
  }

  const P = points.length;
  const toStr = (p: LatLng) => `${p.lat},${p.lng}`;
  const all = points.map(toStr).join("|");
  const distances = Array.from({ length: P }, () => Array<number>(P).fill(0));
  const durations = Array.from({ length: P }, () => Array<number>(P).fill(0));

  const request = async (originsStr: string, originIdx: number[]) => {
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originsStr)}` +
      `&destinations=${encodeURIComponent(all)}&mode=driving&key=${key}`;
    const res = await fetch(url);
    const j = await res.json();
    if (j.status !== "OK") throw new Error(j.error_message || j.status);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    j.rows.forEach((row: any, ri: number) => {
      const oi = originIdx[ri];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      row.elements.forEach((el: any, dj: number) => {
        distances[oi][dj] = el.status === "OK" ? el.distance.value : 0;
        durations[oi][dj] = el.status === "OK" ? el.duration.value : 0;
      });
    });
  };

  try {
    if (P <= 10) {
      // เมทริกซ์เต็มในคำขอเดียว (P² ≤ 100 elements)
      await request(all, points.map((_, i) => i));
    } else {
      // เกิน 100 elements → ยิงทีละ origin
      for (let i = 0; i < P; i++) await request(toStr(points[i]), [i]);
    }
    return NextResponse.json({ distances, durations });
  } catch (e) {
    return NextResponse.json({ distances: null, error: e instanceof Error ? e.message : String(e) });
  }
}
