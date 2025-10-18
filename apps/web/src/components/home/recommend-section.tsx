import type { Product } from "@/types";
import { ProductCard } from "../catalog/product-card";

export function RecommendSection({ title, items }: { title: string; items: ReadonlyArray<Product> }) {
  if (!items?.length) return null;
  return (
    <section className="container-page py-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
