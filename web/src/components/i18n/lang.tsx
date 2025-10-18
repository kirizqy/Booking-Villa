"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Lang = "id" | "en";
type Dict = Record<string, { id: string; en: string }>;

const STRINGS: Dict = {
  deals: { id: "Promo", en: "Deals" },
  support: { id: "Bantuan", en: "Support" },
  partnership: { id: "Kemitraan", en: "Partnership" },
  bookings: { id: "Pesanan", en: "Bookings" },
  cart: { id: "Keranjang", en: "Cart" },
  headline: { id: "Pilihan terbaik untuk liburanmu", en: "The top choice to explore the world" },

  tab_villa: { id: "Villa", en: "Villa" },
  tab_jeep: { id: "Jeep", en: "Jeep" },
  tab_rent: { id: "Rent", en: "Car Rental" },
  tab_doc: { id: "Dokumentasi", en: "Photography" },

  sub_hotels: { id: "Hotel", en: "Hotels" },
  sub_villa: { id: "Villa", en: "Villa" },
  sub_apartment: { id: "Apartemen", en: "Apartment" },

  field_where: { id: "Kota, tujuan, atau nama tempat", en: "City, place to go" },
  field_dates: { id: "Check-In & Check-out", en: "Check-In & Check-out Dates" },
  field_guests: { id: "Tamu & Kamar", en: "Guests & Rooms" },
  search: { id: "Cari", en: "Search" },

  guests: { id: "Tamu", en: "Guests" },

  adults: { id: "Dewasa", en: "Adults" },
  children: { id: "Anak", en: "Children" },
  rooms: { id: "Kamar", en: "Rooms" },
  done: { id: "Selesai", en: "Done" },
};

const LangCtx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof STRINGS) => string;
} | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved) setLang(saved);
  }, []);

  // fallback aman biar gak crash kalau ada key yang belum didefinisikan
  const t = (k: keyof typeof STRINGS) => STRINGS[k]?.[lang] ?? String(k);

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);
  useEffect(() => { localStorage.setItem("lang", lang); }, [lang]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
