"use client";

import { useMemo, useRef, useState } from "react";
import type { Product } from "@/types";
import { daysBetween } from "@/lib/availability";
import { ProductGallery } from "./product-gallery";
import { ProductInfoSection } from "./product-info-sections"; // ✅ perbaiki path
import { ProductBookBlock } from "./product-book-block";
import { StickyBookingBar } from "./sticky-booking-bar";
import {
  priceDokumentasi,
  priceJeep,
  priceTransport,
  priceVilla,
} from "@/lib/pricing";
import { ProductDetailTopbar } from "./product-detail-topbar"; // ✅ pakai topbar yang ada

// FE-only cart v1 (localStorage)
type CartItem =
  | {
      kind: "villa";
      productId: string;
      name: string;
      start: string;
      end: string;
      nights: number;
      baseCapacity: number;
      extraPerson: number;
      unitPrice: number;
      subtotal: number;
    }
  | {
      kind: "jeep" | "dokumentasi";
      productId: string;
      name: string;
      date: string;
      time: string;
      hours: number;
      unitPrice: number;
      subtotal: number;
    }
  | {
      kind: "transport";
      productId: string;
      name: string;
      date: string;
      time: string;
      unitPrice: number;
      subtotal: number;
    };

function pushCart(item: CartItem) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem("cart_v1");
  const arr: CartItem[] = raw ? JSON.parse(raw) : [];
  arr.push(item);
  localStorage.setItem("cart_v1", JSON.stringify(arr));
}

export function ProductDetailClient({
  product,
  initialQuery,
}: {
  product: Product;
  initialQuery?: { start?: string; end?: string; date?: string; time?: string };
}) {
  // Gallery (opsional – placeholder)
  const gallery = undefined;

  // VILLA state
  const [stay, setStay] = useState<{ start?: string; end?: string }>({
    start: initialQuery?.start,
    end: initialQuery?.end,
  });
  const baseCapacity = product.type === "villa" ? product.baseCapacity ?? 2 : 0;
  const [extraPerson, setExtraPerson] = useState(0);

  // Hour-based state
  const [date, setDate] = useState(initialQuery?.date ?? "");
  const [time, setTime] = useState(initialQuery?.time ?? "");
  const [hours, setHours] = useState(2);

  // Total (untuk sticky bar)
  const totalAmount = useMemo(() => {
    if (product.type === "villa" && stay.start && stay.end) {
      return priceVilla({
        pricePerNight: product.price,
        start: stay.start,
        end: stay.end,
        pax: baseCapacity + extraPerson,
        baseCapacity,
      }).subtotal;
    }
    if (product.type === "jeep") {
      return priceJeep({ pricePerHour: product.price, hours }).subtotal;
    }
    if (product.type === "dokumentasi") {
      return priceDokumentasi({ pricePerHour: product.price, hours }).subtotal;
    }
    if (product.type === "transport") {
      return priceTransport({ pricePerRoute: product.price }).subtotal;
    }
    return undefined;
  }, [product.type, product.price, stay, baseCapacity, extraPerson, hours]);

  // Summary sticky bar
  const summary = useMemo(() => {
    if (product.type === "villa") {
      if (!(stay.start && stay.end)) return "Pilih tanggal menginap";
      const nights = daysBetween(stay.start, stay.end);
      return `${nights} malam · +${extraPerson} extra`;
    }
    if (!(date && time)) return "Pilih tanggal & jam";
    if (product.type === "transport") return `${date} · ${time}`;
    return `${date} · ${time} · ${hours} jam`;
  }, [product.type, stay, date, time, hours, extraPerson]);

  const canAdd = useMemo(() => {
    if (product.type === "villa") {
      return Boolean(
        stay.start && stay.end && daysBetween(stay.start, stay.end) > 0
      );
    }
    return Boolean(date && time);
  }, [product.type, stay, date, time]);

  // CTA
  function addBooking() {
    if (product.type === "villa") {
      if (!stay.start || !stay.end) return alert("Pilih tanggal menginap terlebih dahulu.");
      const nights = daysBetween(stay.start, stay.end);
      if (nights <= 0) return alert("Rentang tanggal minimal 1 malam.");
      const calc = priceVilla({
        pricePerNight: product.price,
        start: stay.start,
        end: stay.end,
        pax: baseCapacity + extraPerson,
        baseCapacity,
      });
      pushCart({
        kind: "villa",
        productId: product.id,
        name: product.name,
        start: stay.start,
        end: stay.end,
        nights,
        baseCapacity,
        extraPerson,
        unitPrice: product.price,
        subtotal: calc.subtotal,
      });
      alert("Ditambahkan ke booking.");
      return;
    }

    if (!date || !time) return alert("Pilih tanggal & jam.");

    if (product.type === "transport") {
      const calc = priceTransport({ pricePerRoute: product.price });
      pushCart({
        kind: "transport",
        productId: product.id,
        name: product.name,
        date,
        time,
        unitPrice: product.price,
        subtotal: calc.subtotal,
      });
    } else {
      const calc =
        product.type === "jeep"
          ? priceJeep({ pricePerHour: product.price, hours })
          : priceDokumentasi({ pricePerHour: product.price, hours });
      pushCart({
        kind: product.type,
        productId: product.id,
        name: product.name,
        date,
        time,
        hours,
        unitPrice: product.price,
        subtotal: calc.subtotal,
      });
    }
    alert("Ditambahkan ke booking.");
  }

  function bookNow() {
    addBooking();
    window.location.href = "/cart";
  }

  // scroll ke blok booking dari tombol “select product” (kalau dipakai di info)
  const bookRef = useRef<HTMLDivElement | null>(null);
  const scrollToBook = () =>
    bookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // judul kategori
  const title = useMemo(() => {
    switch (product.type) {
      case "villa":
        return "Villa";
      case "jeep":
        return "Jeep";
      case "transport":
        return "Transport";
      case "dokumentasi":
        return "Dokumentasi";
    }
  }, [product.type]);

  return (
    <>
      {/* Sticky topbar yang muncul saat scroll & sekaligus menyembunyikan navbar utama */}
      <ProductDetailTopbar
        type={product.type}
        baseCapacity={product.baseCapacity ?? 2}
        initial={{
          q: product.location,
          start: stay.start,
          end: stay.end,
          date,
          time,
          hours,
        }}
      />

      <div className="container-page py-6">
        <h1 className="text-xl font-semibold mb-3">{title}</h1>

        {/* OVERVIEW */}
        <section
          id="overview"
          className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr] gap-6 scroll-mt-28"
        >
          <ProductGallery images={gallery} />

          <div className="space-y-4">
            {/* Kalau file ProductInfoSection-mu sudah punya tombol “Select”, pass onSelect=scrollToBook.
               Kalau belum, hapus prop ini saja. */}
            <ProductInfoSection product={product} /* onSelect={scrollToBook} */ />

            <div ref={bookRef}>
              {product.type === "villa" ? (
                <ProductBookBlock
                  product={product}
                  kind="villa"
                  start={stay.start}
                  end={stay.end}
                  onChangeStay={setStay}
                  baseCapacity={baseCapacity}
                  extraPerson={extraPerson}
                  setExtraPerson={setExtraPerson}
                  onAddBooking={addBooking}
                  onBookNow={bookNow}
                />
              ) : (
                <ProductBookBlock
                  product={product}
                  kind={product.type}
                  date={date}
                  time={time}
                  onChangeDate={setDate}
                  onChangeTime={setTime}
                  hours={product.type === "transport" ? undefined : hours}
                  onChangeHours={
                    product.type === "transport" ? undefined : setHours
                  }
                  onAddBooking={addBooking}
                  onBookNow={bookNow}
                />
              )}
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section id="location" className="card mt-6 scroll-mt-28">
          <div className="font-medium mb-2">Location</div>
          <p className="text-sm text-[var(--muted)]">
            {product.location ?? "Lokasi akan ditampilkan di sini."}
          </p>
          <div
            className="mt-3 h-48 rounded-xl border border-[var(--line)] skel"
            aria-hidden
          />
          <ul className="mt-3 text-sm list-disc pl-5 text-[var(--muted)]">
            <li>Dekat ke pusat kota (± 2–5 km)</li>
            <li>Akses destinasi populer dengan transport lokal</li>
          </ul>
        </section>

        {/* FACILITIES */}
        <section id="facilities" className="card mt-6 scroll-mt-28">
          <div className="font-medium mb-2">Facilities</div>
          {product.amenities?.length ? (
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-[var(--muted)]">
              {product.amenities.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Fasilitas detail akan ditambahkan.
            </p>
          )}
        </section>

        {/* POLICY */}
        <section id="policy" className="card mt-6 scroll-mt-28">
          <div className="font-medium mb-2">Policy</div>
          <div className="text-sm text-[var(--muted)] space-y-1">
            <div>Check-in: {product.policy?.checkin ?? "14:00"}</div>
            <div>Check-out: {product.policy?.checkout ?? "12:00"}</div>
            <div>Harga sudah termasuk pajak/biaya.</div>
            <div>
              General instructions: bawa KTP/ID yang berlaku saat check-in.
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews" className="card mt-6 scroll-mt-28">
          <div className="font-medium mb-2">Reviews</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Nadia",
                text: "Bersih, staff ramah, sunrise jeep mantap!",
                stars: 5,
              },
              { name: "Bima", text: "Proses booking cepat, CS responsif.", stars: 5 },
              {
                name: "Sari",
                text: "Dokumentasi bagus, hasil fotonya cakep.",
                stars: 4,
              },
            ].map((r, i) => (
              <div key={i} className="border border-[var(--line)] rounded-xl p-3">
                <div className="font-medium">{r.name}</div>
                <div
                  className="text-yellow-500 text-sm"
                  aria-label={`${r.stars} dari 5 bintang`}
                >
                  {"★".repeat(r.stars)}
                  {"☆".repeat(5 - r.stars)}
                </div>
                <p className="text-sm text-[var(--muted)] mt-1">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky booking bar (mobile) */}
      <StickyBookingBar
        visible={canAdd}
        summary={summary}
        amount={totalAmount}
        onAddBooking={addBooking}
        onBookNow={bookNow}
      />
    </>
  );
}
