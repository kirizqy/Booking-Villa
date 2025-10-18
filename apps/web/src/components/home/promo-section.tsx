import Link from "next/link";
import type { PromoItem } from "@/lib/contracts";

export function PromoSection({ promos }: { promos: ReadonlyArray<PromoItem> }) {
  if (!promos?.length) return null;
  return (
    <section className="container-page py-6" aria-labelledby="promo-title">
      <div className="flex items-center justify-between">
        <h2 id="promo-title" className="text-lg font-semibold">Paket & Promo</h2>
        <Link href="/villa" className="text-sm text-[var(--muted)] underline">
          Lihat semua
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {promos.map((p) => (
          <Link key={p.id} href={p.href} className="card hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.title}</div>
              {p.badge && <span className="badge">{p.badge}</span>}
            </div>
            <div className="text-sm text-[var(--muted)] mt-1">{p.description}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
