"use client";

import { formatRupiah } from "@/lib/format";

export function StickyBookingBar({
  visible,
  summary,
  amount,
  onAddBooking,
  onBookNow,
}: {
  visible: boolean;
  summary: string;
  amount?: number;
  onAddBooking: () => void;
  onBookNow: () => void;
}) {
  if (!visible) return null; // tampil hanya saat siap booking
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t border-[var(--line)] bg-white/95 backdrop-blur">
      <div className="container-page py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-[var(--muted)] truncate">{summary}</div>
          {typeof amount === "number" && (
            <div className="text-sm font-semibold">{formatRupiah(amount)}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn border border-[var(--line)] bg-white" onClick={onAddBooking}>
            Add
          </button>
          <button className="btn btn-brand" onClick={onBookNow}>
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
