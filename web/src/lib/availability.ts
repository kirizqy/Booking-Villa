// ——— Helpers tanggal (timezone-safe, pakai UTC) ———
const DAY_MS = 24 * 60 * 60 * 1000;

// aman: kembalikan Invalid Date kalau format bukan YYYY-MM-DD
function parseYMD(ymd?: string): Date {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return new Date(NaN);
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toYMDUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ——— Util tanggal ———
export function daysBetween(start?: string, end?: string): number {
  const s = parseYMD(start);
  const e = parseYMD(end);
  if (Number.isNaN(+s) || Number.isNaN(+e)) return 0;
  const diff = Math.ceil((e.getTime() - s.getTime()) / DAY_MS);
  return Math.max(diff, 0);
}

/** Iterasi tanggal [start, end) (end eksklusif) */
export function* eachDate(start?: string, end?: string) {
  const s = parseYMD(start);
  const e = parseYMD(end);
  if (Number.isNaN(+s) || Number.isNaN(+e) || s >= e) return;

  for (let d = s; d.getTime() < e.getTime(); d = new Date(d.getTime() + DAY_MS)) {
    yield toYMDUTC(d); // tetap Y-M-D tanpa risiko geser hari
  }
}

// ---- MOCK DATA ----
const VILLA_BLACKOUT = new Set<string>([
  "2025-10-20", "2025-10-21", "2025-11-01",
]);

const DISABLED_SLOTS = new Set<string>(["12:00", "13:00"]); // contoh: jam makan siang

export function isVillaRangeAvailable(start?: string, end?: string) {
  const s = parseYMD(start);
  const e = parseYMD(end);
  if (Number.isNaN(+s) || Number.isNaN(+e) || e.getTime() <= s.getTime()) return false; // minimal 1 malam
  for (const d of eachDate(start, end)) {
    if (VILLA_BLACKOUT.has(d)) return false;
  }
  return true;
}

export type SlotType = "jeep" | "transport" | "dokumentasi";
export type Slot = { time: string; available: boolean };

// Konfigurasi default jam kerja & interval
const DEFAULT_SLOT_START = 6;   // 06:00
const DEFAULT_SLOT_END = 17;    // 17:00
const DEFAULT_STEP_MIN = 60;    // setiap 60 menit

function timeStr(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function hashStr(s: string): number {
  let a = 0;
  for (let i = 0; i < s.length; i++) a = (a * 31 + s.charCodeAt(i)) >>> 0;
  return a;
}

/** Dapatkan slot per jam/menit untuk tipe tertentu. */
export function getSlotsFor(
  date: string,
  type: SlotType,
  opts?: { startHour?: number; endHour?: number; stepMinutes?: number }
): Slot[] {
  if (!date) return [];

  const startHour = opts?.startHour ?? DEFAULT_SLOT_START;
  const endHour = opts?.endHour ?? DEFAULT_SLOT_END;
  const step = opts?.stepMinutes ?? DEFAULT_STEP_MIN;

  const out: Slot[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += step) {
      const t = timeStr(h, m);
      const key = `${date}-${type}-${t}`;
      const pseudoTaken = (hashStr(key) % 5) === 0; // ~20% dianggap sudah dipesan
      const available = !DISABLED_SLOTS.has(t) && !pseudoTaken;
      out.push({ time: t, available });
    }
  }
  return out;
}
