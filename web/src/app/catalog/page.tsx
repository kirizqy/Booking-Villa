"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductType } from "@/mocks/products";
import { PRODUCTS } from "@/mocks/products";
import { CatalogHeader, type Bucket, type SortKey } from "@/components/catalog/catalog-header";
import { InfiniteGrid } from "@/components/catalog/infinite-grid";
import { ProductCard } from "@/components/catalog/product-card";

// ---- Konfigurasi bucket harga per tipe (dalam rupiah) ----
const BUCKETS: Record<ProductType, Bucket[]> = {
  villa: [
    { id: "0-1",   label: "0–1 jt",   min: 0,       max: 1_000_000 },
    { id: "1-2",   label: "1–2 jt",   min: 1_000_000, max: 2_000_000 },
    { id: "2-3",   label: "2–3 jt",   min: 2_000_000, max: 3_000_000 },
    { id: "3-5",   label: "3–5 jt",   min: 3_000_000, max: 5_000_000 },
    { id: "5-up",  label: "≥ 5 jt",   min: 5_000_000, max: Number.POSITIVE_INFINITY },
  ],
  jeep: [
    { id: "0-300",  label: "≤ 300 rb",  min: 0,       max: 300_000 },
    { id: "300-600",label: "300–600 rb",min: 300_000, max: 600_000 },
    { id: "600-up", label: "≥ 600 rb",  min: 600_000, max: Number.POSITIVE_INFINITY },
  ],
  transport: [
    { id: "0-300",  label: "≤ 300 rb",  min: 0,       max: 300_000 },
    { id: "300-800",label: "300–800 rb",min: 300_000, max: 800_000 },
    { id: "800-up", label: "≥ 800 rb",  min: 800_000, max: Number.POSITIVE_INFINITY },
  ],
  dokumentasi: [
    { id: "0-400",  label: "≤ 400 rb",  min: 0,       max: 400_000 },
    { id: "400-800",label: "400–800 rb",min: 400_000, max: 800_000 },
    { id: "800-up", label: "≥ 800 rb",  min: 800_000, max: Number.POSITIVE_INFINITY },
  ],
};

function applyFilters(
  items: Product[],
  opts: { q: string; bucket?: Bucket; rating: number; sort: SortKey }
): Product[] {
  let out = items.slice();

  if (opts.q.trim()) {
    const ql = opts.q.trim().toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(ql) ||
        (p.location?.toLowerCase().includes(ql) ?? false)
    );
  }

  if (opts.bucket) {
    const { min, max } = opts.bucket;
    out = out.filter((p) => p.price >= min && p.price < max);
  }

  if (opts.rating > 0) {
    out = out.filter((p) => (p.rating ?? 0) >= opts.rating);
  }

  switch (opts.sort) {
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "popular":
    default:
      // dummy popularity: rating desc then price asc
      out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.price - b.price);
      break;
  }

  return out;
}

export default function CatalogPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const typeParam = (sp.get("type") as ProductType) || "villa";
  const [type, setType] = useState<ProductType>(typeParam);

  // state filter
  const [q, setQ] = useState<string>(sp.get("q") ?? "");
  const [bucketId, setBucketId] = useState<string>(sp.get("bucket") ?? "");
  const [rating, setRating] = useState<number>(Number(sp.get("rating") ?? 0));
  const [sort, setSort] = useState<SortKey>((sp.get("sort") as SortKey) || "popular");

  // sinkronkan URL ketika filter berubah
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", type);
    if (q) params.set("q", q);
    if (bucketId) params.set("bucket", bucketId);
    if (rating) params.set("rating", String(rating));
    if (sort !== "popular") params.set("sort", sort);
    router.replace(`/catalog?${params.toString()}`);
  }, [type, q, bucketId, rating, sort, router]);

  const buckets = BUCKETS[type];
  const activeBucket = useMemo(
    () => buckets.find((b) => b.id === bucketId),
    [buckets, bucketId]
  );

  const source = useMemo(
    () => PRODUCTS.filter((p) => p.type === type && p.published !== false),
    [type]
  );

  const filtered = useMemo(
    () => applyFilters(source, { q, bucket: activeBucket, rating, sort }),
    [source, q, activeBucket, rating, sort]
  );

  return (
    <div className="container-page py-6">
      {/* Tabs tipe (opsional) */}
      <div className="mb-4">
        <div className="flex gap-3">
          {(["villa", "jeep", "transport", "dokumentasi"] as const).map((t) => {
            const active = t === type;
            return (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setBucketId("");
                  setRating(0);
                  setSort("popular");
                }}
                className={[
                  "px-4 py-2 rounded-full text-sm border",
                  active
                    ? "bg-[var(--brand-600)] text-white border-[var(--brand-600)]"
                    : "bg-white border-[var(--line)] hover:bg-[var(--brand-50)]",
                ].join(" ")}
                aria-pressed={active}
              >
                {t === "dokumentasi" ? "Dokumentasi" : t[0].toUpperCase() + t.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header filter/search */}
      <CatalogHeader
        q={q}
        onQChange={setQ}
        buckets={buckets}
        bucketId={bucketId}
        onBucketChange={setBucketId}
        rating={rating}
        onRatingChange={setRating}
        sort={sort}
        onSortChange={setSort}
        onReset={() => {
          setQ("");
          setBucketId("");
          setRating(0);
          setSort("popular");
        }}
      />

      {/* Grid hasil */}
      {filtered.length === 0 ? (
        <div className="text-sm text-[var(--muted)]">
          Produk tidak ditemukan. Coba ubah kata kunci atau filter.
        </div>
      ) : (
        <InfiniteGrid
          items={filtered}
          pageSize={12}
          renderItem={(p) => <ProductCard key={p.id} p={p} />}
        />
      )}
    </div>
  );
}
