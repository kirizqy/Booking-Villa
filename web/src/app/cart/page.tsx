"use client";
import { useCart, CartItem } from "@/store/cart";
import { formatRupiah } from "@/lib/format";
import { priceVilla, priceJeep, priceTransport, priceDokumentasi } from "@/lib/pricing";

function itemPrice(i: CartItem) {
  if (i.kind==="villa") {
    const r = priceVilla({ pricePerNight: i.pricePerNight, start: i.start, end: i.end, pax: i.pax, baseCapacity: i.baseCapacity }); 
    return { label: `${r.nights} malam`, subtotal: r.subtotal };
  }
  if (i.kind==="jeep") {
    const r = priceJeep({ pricePerHour: i.pricePerHour, hours: i.hours }); 
    return { label: `${r.hours} jam (${i.time})`, subtotal: r.subtotal };
  }
  if (i.kind==="transport") {
    const r = priceTransport({ pricePerRoute: i.pricePerRoute }); 
    return { label: `1 rute`, subtotal: r.subtotal };
  }
  const r = priceDokumentasi({ pricePerHour: i.pricePerHour, hours: i.hours, packagePrice: i.packagePrice });
  return { label: `${r.hours} jam${i.packagePrice?` + paket`:``} (${i.time})`, subtotal: r.subtotal };
}

export default function CartPage() {
  const { items, remove, clear } = useCart();
  const rows = items.map(i => ({ i, ...itemPrice(i) }));
  const total = rows.reduce((a,b)=> a + b.subtotal, 0);

  return (
    <main className="container-page py-8">
      <h1 className="text-xl font-semibold mb-4">Keranjang</h1>

      {items.length === 0 && <div className="card">Keranjang kosong.</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-3">
          {rows.map(({ i, label, subtotal }) => (
            <div key={i.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase text-[var(--muted)]">{i.kind}</div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {i.kind==="villa" && `${i.start} → ${i.end}, pax ${i.pax}`}
                    {i.kind!=="villa" && `${i.date}${"time" in i && i.time ? `, ${i.time}` : ""}`}
                  </div>
                  <div className="text-sm">{label}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatRupiah(subtotal)}</div>
                  <button className="text-xs underline text-red-600 mt-2" onClick={()=>remove(i.id)}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="card self-start">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Total</div>
            <div className="text-lg font-bold">{formatRupiah(total)}</div>
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">Semua harga sudah termasuk pajak (tax-inclusive).</div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="btn btn-ghost" onClick={clear}>Kosongkan</button>
            <a href="/checkout" className="btn btn-brand text-center">Checkout</a>
          </div>
        </aside>
      </div>
    </main>
  );
}
