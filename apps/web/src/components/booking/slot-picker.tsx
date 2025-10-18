"use client";

import { useMemo, useCallback } from "react";
import { getSlotsFor, type Slot, type SlotType } from "@/lib/availability";

export function SlotPicker({
  date,
  type,
  value,
  onChange,
}: {
  date: string;
  type: SlotType;
  value?: string;
  onChange: (t: string) => void;
}) {
  const slots: Slot[] = useMemo(() => (date ? getSlotsFor(date, type) : []), [date, type]);

  const select = useCallback(
    (t: string) => {
      if (!t) return;
      onChange(t);
    },
    [onChange]
  );

  if (!date) return <div className="text-sm text-[var(--muted)]">Pilih tanggal dulu</div>;
  if (!slots.length) return <div className="text-sm text-[var(--muted)]">Tidak ada slot tersedia</div>;

  return (
    <div role="radiogroup" aria-label={`Pilih jam untuk ${type}`} className="grid grid-cols-4 gap-2">
      {slots.map((s) => {
        const selected = value === s.time;
        return (
          <button
            key={s.time}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={!s.available}
            disabled={!s.available}
            onClick={() => select(s.time)}
            className={[
              "border rounded-lg px-2 py-1 text-sm transition",
              s.available ? "hover:bg-[var(--brand-50)]" : "opacity-40 cursor-not-allowed",
              selected ? "border-[var(--brand-600)] ring-1 ring-[var(--brand-600)]" : "border-[var(--line)]",
            ].join(" ")}
          >
            {s.time}
          </button>
        );
      })}
    </div>
  );
}
