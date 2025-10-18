import { PRODUCTS } from "@/mocks/products";
import { PROMOS } from "@/lib/config";
import type { ProductListItem, SearchParams, TrendingParams, PromoItem } from "../contracts";

type MockProduct = typeof PRODUCTS[number];
type WithCover = { cover?: string };

function toListItem(p: MockProduct): ProductListItem {
  const cover = (p as MockProduct & WithCover).cover; // <— tidak pakai any
  return {
    id: p.id,
    type: p.type,
    slug: p.slug,
    name: p.name,
    location: p.location,
    price: p.price,
    unit: p.unit,
    rating: p.rating,
    cover, // opsional, aman kalau undefined
  };
}

export async function listTrending({ type, limit = 4 }: TrendingParams) {
  const list = PRODUCTS
    .filter((p) => p.type === type)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit)
    .map(toListItem);

  return Promise.resolve(list);
}

export async function searchCatalog(params: SearchParams) {
  const { type, q } = params;
  let list = PRODUCTS.filter((p) => p.type === type);
  if (q) {
    const s = q.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(s) || (p.location ?? "").toLowerCase().includes(s)
    );
  }
  return Promise.resolve(list.map(toListItem));
}

// --- FIX untuk readonly promos:
export async function listPromos(): Promise<PromoItem[]> {
  // buat salinan objek agar tidak "readonly"
  return Promise.resolve(PROMOS.map((p) => ({ ...p })));
}
