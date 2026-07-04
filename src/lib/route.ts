/**
 * จัดเส้นทางรับของให้คนขับ (TSP แบบ open-path จากตำแหน่งฐาน)
 * nearest-neighbor + 2-opt
 * - default: ระยะ haversine (เส้นตรง) — ฟรี ไม่ต้องมี key
 * - ถ้าส่ง distance matrix (จาก Google Distance Matrix) เข้ามา → ใช้ระยะถนนจริง + เวลาจริง
 */
import { distanceKm } from "./geo";

export interface RoutePoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sub?: string;
}
export interface OptimizedRoute {
  order: RoutePoint[];
  legs: number[]; // ระยะแต่ละช่วง (กม.)
  totalKm: number;
  totalMin: number | null; // เวลาจริงจาก Google (นาที) ถ้ามี
}

type LatLng = { lat: number; lng: number };

/** index 0 = base, i+1 = stops[i] */
type DistFn = (i: number, j: number) => number;

function pathDist(order: number[], dist: DistFn): number {
  if (order.length === 0) return 0;
  let t = dist(0, order[0]);
  for (let i = 0; i < order.length - 1; i++) t += dist(order[i], order[i + 1]);
  return t;
}

function nearestNeighbor(n: number, dist: DistFn): number[] {
  const remaining = Array.from({ length: n }, (_, i) => i + 1);
  const order: number[] = [];
  let cur = 0;
  while (remaining.length) {
    let bi = 0;
    let bd = Infinity;
    for (let k = 0; k < remaining.length; k++) {
      const dd = dist(cur, remaining[k]);
      if (dd < bd) {
        bd = dd;
        bi = k;
      }
    }
    cur = remaining[bi];
    order.push(remaining[bi]);
    remaining.splice(bi, 1);
  }
  return order;
}

function twoOpt(start: number[], dist: DistFn): number[] {
  let best = start.slice();
  let bestD = pathDist(best, dist);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const cand = best.slice(0, i).concat(best.slice(i, j + 1).reverse(), best.slice(j + 1));
        const cd = pathDist(cand, dist);
        if (cd + 1e-9 < bestD) {
          best = cand;
          bestD = cd;
          improved = true;
        }
      }
    }
  }
  return best;
}

/**
 * @param dm distance matrix (เมตร) (N+1)×(N+1), 0=base — ถ้ามี = ระยะถนนจริง
 * @param dur duration matrix (วินาที) — ถ้ามี = เวลาจริง
 */
export function optimizeRoute(base: LatLng, stops: RoutePoint[], dm?: number[][], dur?: number[][]): OptimizedRoute {
  const n = stops.length;
  if (n === 0) return { order: [], legs: [], totalKm: 0, totalMin: null };

  const dist: DistFn = (i, j) => {
    if (dm) return dm[i][j] / 1000;
    const a = i === 0 ? base : stops[i - 1];
    const b = j === 0 ? base : stops[j - 1];
    return distanceKm(a.lat, a.lng, b.lat, b.lng);
  };

  const idxOrder = twoOpt(nearestNeighbor(n, dist), dist);
  const order = idxOrder.map((i) => stops[i - 1]);

  const legs: number[] = [];
  let prev = 0;
  for (const i of idxOrder) {
    legs.push(dist(prev, i));
    prev = i;
  }

  let totalMin: number | null = null;
  if (dur) {
    let sec = 0;
    prev = 0;
    for (const i of idxOrder) {
      sec += dur[prev][i];
      prev = i;
    }
    totalMin = Math.round(sec / 60);
  }

  return { order, legs, totalKm: legs.reduce((s, x) => s + x, 0), totalMin };
}

export function googleMapsDirUrl(base: LatLng, order: RoutePoint[]): string {
  if (order.length === 0) return "https://www.google.com/maps";
  const dest = order[order.length - 1];
  const p = new URLSearchParams({
    api: "1",
    origin: `${base.lat},${base.lng}`,
    destination: `${dest.lat},${dest.lng}`,
    travelmode: "driving",
  });
  const wp = order.slice(0, -1).map((x) => `${x.lat},${x.lng}`).join("|");
  if (wp) p.set("waypoints", wp);
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

// ประมาณการ (ใช้เมื่อไม่มีเวลาจริงจาก Google)
export const FUEL_BAHT_PER_KM = 4;
export const AVG_SPEED_KMH = 22;
export const MIN_PER_STOP = 8;

export function routeEstimates(totalKm: number, stops: number, realMin?: number | null) {
  return {
    fuel: Math.round(totalKm * FUEL_BAHT_PER_KM),
    mins: realMin ?? Math.round((totalKm / AVG_SPEED_KMH) * 60 + stops * MIN_PER_STOP),
  };
}
