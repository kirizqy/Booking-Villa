"use client";

import { useEffect, useRef, useState } from "react";

export function SimpleGuestPicker({
  value,
  onChange,
  label = "Tamu",
}: {
  value: number;
  onChange: (n: number) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const dec = () => onChange(Math.max(1, value - 1));
  const inc = () => onChange(value + 1);

  // tutup saat klik di luar / Esc
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="guest-panel"
      >
        <span>{`${label}: ${value}`}</span>
        <span aria-hidden="true">👤</span>
      </button>

      {open && (
        <div
          id="guest-panel"
          ref={panelRef}
          className="absolute z-50 mt-2 w-[min(92vw,320px)] rounded-2xl border border-[var(--line)] bg-white shadow-lg p-3"
          role="dialog"
          aria-label={label}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">{label}</div>
            <div className="flex items-center gap-2">
              <button type="button" className="border px-2 py-1 rounded-md" onClick={dec} aria-label="Kurangi">−</button>
              <span className="w-6 text-center" aria-live="polite">{value}</span>
              <button type="button" className="border px-2 py-1 rounded-md" onClick={inc} aria-label="Tambah">+</button>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button type="button" className="btn btn-brand" onClick={() => setOpen(false)}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
