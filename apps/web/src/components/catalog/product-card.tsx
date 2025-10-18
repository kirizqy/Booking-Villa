import Link from "next/link";
import type { Product } from "@/types";
import { formatUnitPrice } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={ROUTES.product(p.type, p.slug)}
      className="card block hover:shadow-md transition"
    >
      {/* Placeholder cover (nanti ganti <Image> pas BE siap) */}
      <div className="aspect-[16/10] rounded-xl bg-[var(--brand-50)] skel mb-3" />

      <div className="flex items-start justify-between gap-2">
        <div className="font-medium">{p.name}</div>
        {typeof p.rating === "number" && (
          <span className="badge" aria-label={`Rating ${p.rating} dari 5`}>
            ⭐ {p.rating.toFixed(1)}
          </span>
        )}
      </div>

      {p.location && (
        <div className="text-sm text-[var(--muted)]">{p.location}</div>
      )}

      <div className="mt-2 text-sm">
        <span className="font-semibold">{formatUnitPrice(p.price, p.unit)}</span>
      </div>
    </Link>
  );
}
