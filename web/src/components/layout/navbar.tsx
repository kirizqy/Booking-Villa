"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/i18n/lang";

const langs = ["id", "en"] as const;
type Lang = (typeof langs)[number];
const isLang = (v: string): v is Lang =>
  (langs as readonly string[]).includes(v);

type Key = "villa" | "jeep" | "rent" | "dokumentasi";

export function Navbar() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const { lang, setLang } = useLang();

  // FIX: di non-home, navbar harus solid sejak awal (biar tidak "hilang").
  useEffect(() => {
    const shouldSolidInitial = pathname !== "/";
    const onScroll = () => setSolid(shouldSolidInitial || window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // deteksi kategori aktif dari URL
  const active = useMemo<Key | undefined>(() => {
    const segs = pathname.split("/").filter(Boolean);

    // /product/{type}/{slug}
    if (segs[0] === "product" && segs[1]) {
      const t = segs[1];
      if (t === "villa" || t === "jeep" || t === "dokumentasi") return t;
      if (t === "transport") return "rent"; // map transport → rent
    }

    // /{section}
    const first = segs[0];
    if (first === "villa" || first === "jeep" || first === "dokumentasi")
      return first;
    if (first === "rent") return "rent";

    return undefined;
  }, [pathname]);

  const textOn = solid ? "text-[var(--text)]" : "text-white";
  const subOn = solid ? "text-[var(--muted)]" : "text-white/80";

  const onChangeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.currentTarget.value;
    if (isLang(v)) setLang(v);
  };

  const linkCls = (k: Key) =>
    `text-sm hover:underline ${subOn} ${active === k ? "font-semibold text-[var(--text)] underline decoration-[var(--brand-600)] underline-offset-4" : ""}`;

  return (
    <header id="site-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        solid ? "navbar-solid" : "navbar-transparent"
      }`}
    >
      <div className="container-page">
        {/* Baris 1 */}
        <div className="h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Beranda"
          >
            <div
              className={`h-7 w-7 rounded-md ${solid ? "bg-[var(--brand-600)]" : "bg-white/90"}`}
              aria-hidden="true"
            />
            <span className={`font-semibold tracking-wide ${textOn}`}>
              Green&Grey
            </span>
          </Link>
          <nav className="flex items-center gap-3" aria-label="Aksi utama">
            <Link href="/booking" className="btn btn-brand">
              Booking
            </Link>
            <label className="sr-only" htmlFor="langSel">
              Language
            </label>
            <select
              id="langSel"
              value={lang}
              onChange={onChangeLang}
              className={`rounded-md text-xs px-2 py-1 border ${
                solid
                  ? "border-[var(--line)]"
                  : "bg-white/10 text-white border-white/30"
              }`}
              aria-label="Language"
            >
              {langs.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </nav>
        </div>

        {/* Baris 2: menu produk (global) */}
        <nav className="h-9 flex items-center gap-5" aria-label="Menu produk">
          <Link
            href="/villa"
            className={linkCls("villa")}
            aria-current={active === "villa" ? "page" : undefined}
          >
            Villa
          </Link>
          <Link
            href="/jeep"
            className={linkCls("jeep")}
            aria-current={active === "jeep" ? "page" : undefined}
          >
            Jeep
          </Link>
          <Link
            href="/rent"
            className={linkCls("rent")}
            aria-current={active === "rent" ? "page" : undefined}
          >
            Rent
          </Link>
          <Link
            href="/dokumentasi"
            className={linkCls("dokumentasi")}
            aria-current={active === "dokumentasi" ? "page" : undefined}
          >
            Dokumentasi
          </Link>
        </nav>
      </div>
    </header>
  );
}
