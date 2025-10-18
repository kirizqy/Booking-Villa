export function InfoHowTo() {
  return (
    <section className="container-page py-10">
      <h2 className="text-lg font-semibold mb-4">How to Book</h2>
      <ol className="list-decimal list-inside text-sm text-[var(--muted)] space-y-1 card">
        <li>Pilih tipe produk & tanggal/slot</li>
        <li>Tambahkan ke keranjang (bisa campur 4 produk)</li>
        <li>Checkout & bayar (tax-inclusive)</li>
        <li>Terima Provisional Invoice via Email/WA</li>
      </ol>
    </section>
  );
}
