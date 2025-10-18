import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS } from "@/mocks/products";
import type { Product, ProductType } from "@/types";
import { ProductDetailClient } from "@/components/product/product-detail-client";

// Next 15: params di generateMetadata harus di-await
export async function generateMetadata(
  props: { params: Promise<{ type: ProductType; slug: string }> }
): Promise<Metadata> {
  const { type, slug } = await props.params;
  const p = PRODUCTS.find((x) => x.type === type && x.slug === slug);
  return {
    title: p ? `${p.name} — Green & Grey` : "Produk tidak ditemukan",
    description: p?.location ? `Detail ${p.name} di ${p.location}` : p ? `Detail ${p.name}` : "",
  };
}

export default async function ProductDetailPage(props: {
  params: Promise<{ type: ProductType; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { type, slug } = await props.params;
  const sp = await props.searchParams;

  const product: Product | undefined =
    PRODUCTS.find((x) => x.type === type && x.slug === slug);
  if (!product) return notFound();

  return (
    <ProductDetailClient
      product={product}
      initialQuery={{
        start: typeof sp.start === "string" ? sp.start : undefined,
        end:   typeof sp.end   === "string" ? sp.end   : undefined,
        date:  typeof sp.date  === "string" ? sp.date  : undefined,
        time:  typeof sp.time  === "string" ? sp.time  : undefined,
      }}
    />
  );
}
