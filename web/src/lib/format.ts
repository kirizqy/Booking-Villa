/** Format angka ke Rupiah standar, default tanpa desimal */
export function formatRupiah(
  n: number | bigint,
  opts: { fractionDigits?: number } = {}
) {
  const value = typeof n === "bigint" ? Number(n) : n;
  const maximumFractionDigits = opts.fractionDigits ?? 0;

  if (!Number.isFinite(value)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value);
}

/** Versi singkat: Rp1,2 jt / Rp3,5 M — enak buat badge “mulai dari” */
export function formatRupiahShort(n: number | bigint) {
  const value = typeof n === "bigint" ? Number(n) : n;
  if (!Number.isFinite(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Tambahkan unit harga (malam/jam/rute) biar rapi di kartu produk */
export function formatUnitPrice(
  n: number | bigint,
  unit?: "malam" | "jam" | "rute"
) {
  return unit ? `${formatRupiah(n)} / ${unit}` : formatRupiah(n);
}

/** (Opsional) parse string Rupiah ke number; return null kalau gagal */
export function parseRupiahToNumber(s: string): number | null {
  // buang semua char non-digit kecuali koma/titik pemisah desimal
  const cleaned = s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}
