"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/i18n/lang";
import { StayDatePicker } from "@/components/booking/stay-date-picker";
import { SimpleGuestPicker } from "@/components/booking/simple-guest-picker";
import { SlotPicker } from "@/components/booking/slot-picker";

type Tab = "villa" | "jeep" | "transport" | "dokumentasi";

export function Hero() {
  const router = useRouter();
  const { t } = useLang();

  const [tab, setTab] = useState<Tab>("villa");

  // Villa
  const [stay, setStay] = useState<{ start?: string; end?: string }>({});
  const [guests, setGuests] = useState<number>(2);

  // Hour-based
  const [where, setWhere] = useState("");
  const [hourDate, setHourDate] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [slotOpen, setSlotOpen] = useState(false);
  const slotRef = useRef<HTMLDivElement | null>(null);

  // close popover saat klik di luar / Esc
  useEffect(() => {
    if (!slotOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!slotRef.current) return;
      if (!slotRef.current.contains(e.target as Node)) setSlotOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSlotOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [slotOpen]);

  // jika tanggal hour-based dihapus, tutup popover & reset slot
  useEffect(() => {
    if (!hourDate) {
      setSlot("");
      setSlotOpen(false);
    }
  }, [hourDate]);

  // readiness untuk tombol
  const readyVilla = !!stay.start && !!stay.end;
  const readyHour  = !!hourDate && !!slot;

  function search() {
    if (tab === "villa") {
      const q = new URLSearchParams({ type: "villa" });
      if (stay.start) q.set("start", stay.start);
      if (stay.end) q.set("end", stay.end);
      if (where) q.set("q", where);
      q.set("adults", String(guests));
      router.push(`/catalog?${q.toString()}`);
      return;
    }

    // hour-based
    const q = new URLSearchParams({ type: tab, date: hourDate, time: slot });
    if (where) q.set("q", where);
    router.push(`/catalog?${q.toString()}`);
  }

  const tabs: ReadonlyArray<{ key: Tab; label: string }> = [
    { key: "villa",        label: t("tab_villa") },
    { key: "jeep",         label: t("tab_jeep") },
    { key: "transport",    label: t("tab_rent") },
    { key: "dokumentasi",  label: t("tab_doc") },
  ];

  return (
    <section className="hero-img -mt-[calc(var(--nav-sm)+var(--nav-sub))] md:-mt-[calc(var(--nav-md)+var(--nav-sub))]">
      <div className="container-page pt-28 md:pt-36 pb-12">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white text-center">
          {t("headline")}
        </h1>

        {/* Tabs utama */}
        <div className="mt-6 flex justify-center">
          <div className="flex gap-4 overflow-x-auto pb-1">
            {tabs.map((x) => {
              const active = tab === x.key;
              return (
                <button
                  key={x.key}
                  onClick={() => setTab(x.key)}
                  className={
                    active
                      ? "px-4 py-2 rounded-full text-sm border bg-white text-[var(--text)] border-white shadow"
                      : "py-2 text-white/90 hover:text-white text-sm"
                  }
                >
                  {x.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4 bg-white rounded-2xl shadow border border-[var(--line)] p-2 md:p-3">
          {tab === "villa" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                {/* WHERE */}
                <label className="input flex items-center gap-2">
                  <span aria-hidden="true">📍</span>
                  <input
                    className="outline-none w-full text-sm bg-transparent"
                    placeholder={t("field_where")}
                    value={where}
                    onChange={(e) => setWhere(e.target.value)}
                  />
                </label>

                {/* DATE RANGE */}
                <StayDatePicker start={stay.start} end={stay.end} onChange={setStay} />

                {/* SIMPLE GUESTS */}
                {/* 🔧 ganti t("guests") -> t("field_guests") biar aman di i18n */}
                <SimpleGuestPicker value={guests} onChange={setGuests} label={t("field_guests")} />

                {/* SEARCH */}
                <button
                  type="button"
                  onClick={search}
                  className="btn btn-search text-white text-base"
                  disabled={!readyVilla}
                  title={!readyVilla ? "Pilih tanggal check-in & check-out" : ""}
                >
                  {t("search")} 🔎
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 text-xs text-[var(--muted)] px-1 mt-2">
                <div>&nbsp;</div>
                <div className="text-center">{t("field_dates")}</div>
                <div className="text-right">{t("field_guests")}</div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 relative">
              {/* WHERE */}
              <label className="input flex items-center gap-2">
                <span aria-hidden="true">📍</span>
                <input
                  className="outline-none w-full text-sm bg-transparent"
                  placeholder={t("field_where")}
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                />
              </label>

              {/* DATE */}
              <label className="input flex items-center gap-2">
                <span aria-hidden="true">📅</span>
                <input
                  type="date"
                  className="outline-none w-full text-sm bg-transparent"
                  value={hourDate}
                  onChange={(e) => setHourDate(e.target.value)}
                />
              </label>

              {/* SLOT */}
              <div className="relative" ref={slotRef}>
                <button
                  type="button"
                  className="input w-full flex items-center justify-between"
                  onClick={() => setSlotOpen((o) => !o)}
                  aria-haspopup="dialog"
                  aria-expanded={slotOpen}
                  disabled={!hourDate}
                  title={!hourDate ? "Pilih tanggal dulu" : ""}
                >
                  <span className={slot ? "" : "text-[var(--muted)]"}>
                    {slot ? `Jam: ${slot}` : "Pilih jam"}
                  </span>
                  <span aria-hidden="true">🕘</span>
                </button>
                {slotOpen && (
                  <div
                    className="absolute z-50 mt-2 w-[min(92vw,460px)] rounded-2xl border border-[var(--line)] bg-white shadow-lg p-3"
                    role="dialog"
                    aria-label="Pilih jam"
                  >
                    <SlotPicker
                      date={hourDate}
                      type={tab === "jeep" ? "jeep" : tab === "transport" ? "transport" : "dokumentasi"}
                      value={slot}
                      onChange={(t) => { setSlot(t); setSlotOpen(false); }}
                    />
                  </div>
                )}
              </div>

              {/* SEARCH */}
              <button
                type="button"
                onClick={search}
                className="btn btn-search text-white text-base"
                disabled={!readyHour}
                title={!readyHour ? "Pilih tanggal & jam" : ""}
              >
                {t("search")} 🔎
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
