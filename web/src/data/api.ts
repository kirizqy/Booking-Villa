import { PRODUCTS } from "@/mocks/products";
import type { Product, ProductType, SortKey } from "@/types";
import { PROMOS } from "@/lib/config";

export interface ListParams {
  type?: ProductType;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortKey;
  offset?: number;
  limit?: number;
}

/**
 * FE data gateway — sekarang baca dari mock,
 * nanti tinggal ganti ke fetch BE tanpa mengubah pemanggil di komponen.
 */
export async function listProducts(params: ListParams = {}): Promise<Product[]> {
  const {
    type,
    q,
    minPrice,
    maxPrice,
    minRating,
    sort = "popular",
    offset = 0,
    limit = 24,
  } = params;

  let rows = PRODUCTS.filter((p) => p.published);

  if (type) rows = rows.filter((p) => p.type === type);

  if (q && q.trim()) {
    const needle = q.toLowerCase();
    rows = rows.filter((p) =>
      (p.name + " " + (p.location ?? "")).toLowerCase().includes(needle)
    );
  }

  if (typeof minPrice === "number") rows = rows.filter((p) => p.price >= minPrice);
  if (typeof maxPrice === "number") rows = rows.filter((p) => p.price <= maxPrice);
  if (typeof minRating === "number") rows = rows.filter((p) => (p.rating ?? 0) >= minRating);

  switch (sort) {
    case "price-asc":
      rows = [...rows].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      rows = [...rows].sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      rows = [...rows].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "popular":
    default:
      // biarkan urutan mock sebagai "popular"
      break;
  }

  return rows.slice(offset, offset + limit);
}

export async function getProductBySlug(
  type: ProductType,
  slug: string
): Promise<Product | undefined> {
  return PRODUCTS.find((p) => p.type === type && p.slug === slug);
}

/** Untuk landing page: trending per tipe, default limit 4 */
export async function listTrending(params: {
  type?: ProductType;
  offset?: number;
  limit?: number;
} = {}): Promise<Product[]> {
  const { type, offset = 0, limit = 4 } = params;
  let rows = PRODUCTS.filter((p) => p.published && p.trending);
  if (type) rows = rows.filter((p) => p.type === type);
  return rows.slice(offset, offset + limit);
}

/** Ambil daftar promo (FE-only): langsung dari config */
export async function listPromos() {
  return [...PROMOS];
}
