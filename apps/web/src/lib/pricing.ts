// src/lib/pricing.ts
import { daysBetween } from "./availability";

/** Biaya extra person (tax-inclusive) */
export const EXTRA_PERSON_FEE = 200_000 as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const toRp = (n: number) => Math.max(0, Math.round(n || 0));
const nonNegInt = (n: number) => Math.max(0, Math.floor(n || 0));

/* ────────────────────────────────────────────────────────────────────────────
 * VILLA — per malam, kapasitas dasar, optional late checkout (untuk invoice)
 * start/end "YYYY-MM-DD"; pax >= baseCapacity
 * ────────────────────────────────────────────────────────────────────────── */
export function priceVilla(opts: {
  pricePerNight: number;
  start: string;
  end: string;
  pax: number;
  baseCapacity: number;
  lateCheckoutHours?: number;
  lateCheckoutRatePerHour?: number;
}) {
  const nights = nonNegInt(daysBetween(opts.start, opts.end));
  const extra = nonNegInt((opts.pax ?? 0) - (opts.baseCapacity ?? 0));
  const extraFee = toRp(extra * EXTRA_PERSON_FEE * nights);
  const room = toRp((opts.pricePerNight ?? 0) * nights);

  const lateH = nonNegInt(opts.lateCheckoutHours ?? 0);
  const lateRate = toRp(opts.lateCheckoutRatePerHour ?? 0);
  const lateFee = toRp(lateH * lateRate);

  return {
    nights,
    extraPersons: extra,
    roomSubtotal: room,
    extraFee,
    lateCheckoutHours: lateH,
    lateCheckoutFee: lateFee,
    subtotal: toRp(room + extraFee + lateFee),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * JEEP — per jam (minimal 1 jam)
 * ────────────────────────────────────────────────────────────────────────── */
export function priceJeep(opts: { pricePerHour: number; hours: number }) {
  const h = Math.max(1, nonNegInt(opts.hours));
  return {
    hours: h,
    subtotal: toRp((opts.pricePerHour ?? 0) * h),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * TRANSPORT — per rute
 * ────────────────────────────────────────────────────────────────────────── */
export function priceTransport(opts: { pricePerRoute: number }) {
  return { subtotal: toRp(opts.pricePerRoute ?? 0) };
}

/* ────────────────────────────────────────────────────────────────────────────
 * DOKUMENTASI — per jam + optional paket foto (flat)
 * ────────────────────────────────────────────────────────────────────────── */
export function priceDokumentasi(opts: {
  pricePerHour: number;
  hours: number;
  packagePrice?: number;
}) {
  const h = Math.max(1, nonNegInt(opts.hours));
  const pack = toRp(opts.packagePrice ?? 0);
  return {
    hours: h,
    packagePrice: pack,
    subtotal: toRp((opts.pricePerHour ?? 0) * h + pack),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * ADD-ONS — baris add-on (makanan, overtime, dll)
 * ────────────────────────────────────────────────────────────────────────── */
export type AddOnLine = { id: string; label: string; qty: number; unitPrice: number };
export function priceAddOns(lines: AddOnLine[]) {
  const items = (lines ?? []).map((l) => {
    const qty = nonNegInt(l.qty);
    const unit = toRp(l.unitPrice);
    return { ...l, qty, unitPrice: unit, lineTotal: toRp(qty * unit) };
  });
  const subtotal = toRp(items.reduce((a, it) => a + it.lineTotal, 0));
  return { items, subtotal };
}

/* ────────────────────────────────────────────────────────────────────────────
 * REFUND — potongan fee (default 20%) dari nilai refundable
 * ────────────────────────────────────────────────────────────────────────── */
export function computeRefund(refundableAmount: number, feeRate = 0.2) {
  const base = toRp(refundableAmount);
  const fee = toRp(base * feeRate);
  const refund = toRp(base - fee);
  return {
    refundableBase: base,
    feeRate,
    feeDeduction: fee,
    refundAmount: refund,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * CART MERGE — total campuran 4 produk + add-ons (tax-inclusive)
 * ────────────────────────────────────────────────────────────────────────── */
export type CartLine =
  | { kind: "villa";        subtotal: number }
  | { kind: "jeep";         subtotal: number }
  | { kind: "transport";    subtotal: number }
  | { kind: "dokumentasi";  subtotal: number }
  | { kind: "addon";        subtotal: number };

export function sumCart(lines: CartLine[]) {
  const safe = (lines ?? []).map((l) => ({ ...l, subtotal: toRp(l.subtotal) }));
  const totals = safe.reduce(
    (acc, l) => {
      acc.grand += l.subtotal;
      acc.byKind[l.kind] = (acc.byKind[l.kind] ?? 0) + l.subtotal;
      return acc;
    },
    { grand: 0, byKind: {} as Record<CartLine["kind"], number> }
  );
  totals.grand = toRp(totals.grand);
  return totals;
}

/** RENT (per-hari). Minimal 1 hari. graceHours: toleransi sisa jam tidak dibulatkan. */
export function priceRentDaily(opts: {
  pricePerDay: number;
  startDate: string;          // "YYYY-MM-DD"
  endDate: string;            // "YYYY-MM-DD"
  startTime?: string;         // "HH:mm" (default "09:00")
  endTime?: string;           // "HH:mm" (default "09:00")
  graceHours?: number;        // default 1
}) {
  const st = new Date(`${opts.startDate}T${opts.startTime ?? "09:00"}:00`);
  const en = new Date(`${opts.endDate}T${opts.endTime ?? "09:00"}:00`);
  if (!(isFinite(+st) && isFinite(+en)) || en <= st) {
    return { days: 0, subtotal: 0 };
  }

  const diffMs = en.getTime() - st.getTime();
  const daysFloat = diffMs / DAY_MS;
  let days = Math.floor(daysFloat);
  const remainderHours = (daysFloat - days) * 24;
  const grace = nonNegInt(opts.graceHours ?? 1);

  if (days === 0) days = 1;
  else if (remainderHours > grace) days += 1;

  return { days, subtotal: toRp(days * (opts.pricePerDay ?? 0)) };
}