export type FeatureFlags = {
  /** Tampilkan section "Paket & Promo" di landing page */
  showPromoPackages: boolean;
};

/**
 * Bisa di-override lewat ENV:
 *  - NEXT_PUBLIC_SHOW_PROMOS=true | false
 * (NEXT_PUBLIC_* akan di-inline ke client oleh Next.js)
 */
function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return /^(1|true|yes|on)$/i.test(raw);
}

export const features: FeatureFlags = {
  showPromoPackages: envBool("NEXT_PUBLIC_SHOW_PROMOS", true),
};

export function isPromoEnabled() {
  return features.showPromoPackages;
}

export type Promo = {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
};

export const PROMOS = [
  { id: "pk1", title: "Paket Hemat Honeymoon", description: "2 malam villa + dokumentasi 2 jam", href: "/villa",        badge: "New" },
  { id: "pk2", title: "Explore Bromo",         description: "Jeep 4 jam + dokumentasi 1 jam",   href: "/jeep" },
  { id: "pk3", title: "Airport Transfer + Check-in", description: "Transport bandara → villa",   href: "/rent" },
] as const;

/* Dev guard kecil: deteksi ID promo duplikat saat development */
if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  for (const p of PROMOS) {
    if (seen.has(p.id)) {
      // eslint-disable-next-line no-console
      console.warn(`[PROMOS] Duplicate id detected: ${p.id}`);
    }
    seen.add(p.id);
  }
}
