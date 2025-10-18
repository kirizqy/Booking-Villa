"use client";

import type { Product } from "@/types";
import { StayDatePicker } from "@/components/booking/stay-date-picker";
import { SlotPicker } from "@/components/booking/slot-picker";
import { daysBetween } from "@/lib/availability";
import { formatRupiah } from "@/lib/format";
import {
  EXTRA_PERSON_FEE,
  priceDokumentasi,
  priceJeep,
  priceTransport,
  priceVilla,
} from "@/lib/pricing";

type VillaProps = {
  kind: "villa";
  start?: string;
  end?: string;
  onChangeStay: (v: { start?: string; end?: string }) => void;
  baseCapacity: number;
  extraPerson: number;
  setExtraPerson: (n: number) => void;
};

type HourBasedProps = {
  kind: "jeep" | "transport" | "dokumentasi";
  date: string;
  time: string;
  onChangeDate: (s: string) => void;
  onChangeTime: (s: string) => void;
  hours?: number;
  onChangeHours?: (n: number) => void;
};

type Common = {
  product: Product;
  onAddBooking: () => void;
  onBookNow: () => void;
};

export function ProductBookBlock(props: Common & (VillaProps | HourBasedProps)) {
  const { product, onAddBooking, onBookNow } = props;

  return (
    <div className="card">
      {props.kind === "villa" ? (
        <div className="space-y-3">
          <div className="font-medium">Pesan Villa</div>

          {/* TANGGAL */}
          <StayDatePicker
            start={props.start}
            end={props.end}
            onChange={props.onChangeStay}
          />

          {/* GUEST TERKUNCI + EXTRA PERSON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="text-sm">
              <div className="mb-1 text-[var(--muted)]">Tamu (kapasitas dasar)</div>
              <input className="input" value={`${props.baseCapacity} orang`} disabled aria-disabled />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-[var(--muted)]">
                Add-on: Tambahan orang ({formatRupiah(EXTRA_PERSON_FEE)} / malam / orang)
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="border px-3 py-2 rounded-md"
                  onClick={() => props.setExtraPerson(Math.max(0, props.extraPerson - 1))}
                  aria-label="Kurangi tambahan orang">−</button>
                <span className="w-8 text-center">{props.extraPerson}</span>
                <button type="button" className="border px-3 py-2 rounded-md"
                  onClick={() => props.setExtraPerson(props.extraPerson + 1)}
                  aria-label="Tambah tambahan orang">+</button>
              </div>
            </label>
          </div>

          {/* BREAKDOWN */}
          {props.start && props.end && (
            <VillaBreakdown
              pricePerNight={product.price}
              start={props.start}
              end={props.end}
              baseCapacity={props.baseCapacity}
              extraPerson={props.extraPerson}
            />
          )}

          {/* CTA */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onAddBooking} className="btn border border-[var(--line)] bg-white">
              Add Booking
            </button>
            <button type="button" onClick={onBookNow} className="btn btn-brand">
              Booking Now
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="font-medium">
            Pesan {props.kind === "jeep" ? "Jeep" : props.kind === "transport" ? "Transport" : "Dokumentasi"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="text-sm">
              <div className="mb-1 text-[var(--muted)]">Tanggal</div>
              <input type="date" className="input" value={props.date}
                     onChange={(e) => props.onChangeDate(e.target.value)} />
            </label>
            <label className="text-sm">
              <div className="mb-1 text-[var(--muted)]">Jam</div>
              <div className="input">
                <SlotPicker date={props.date} type={props.kind} value={props.time} onChange={props.onChangeTime} />
              </div>
            </label>
          </div>

          {(props.kind === "jeep" || props.kind === "dokumentasi") && props.onChangeHours && (
            <label className="text-sm">
              <div className="mb-1 text-[var(--muted)]">Durasi (jam)</div>
              <select className="select" value={props.hours ?? 2}
                      onChange={(e) => props.onChangeHours!(Number(e.target.value))}>
                {[1,2,3,4,5,6,7,8].map((h) => <option key={h} value={h}>{h} jam</option>)}
              </select>
            </label>
          )}

          <HourBasedBreakdown kind={props.kind} unitPrice={product.price} hours={props.hours ?? 0} />

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onAddBooking} className="btn border border-[var(--line)] bg-white">
              Add Booking
            </button>
            <button type="button" onClick={onBookNow} className="btn btn-brand">
              Booking Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Breakdown components (unchanged) ===== */
function VillaBreakdown({
  pricePerNight, start, end, baseCapacity, extraPerson,
}: {
  pricePerNight: number; start: string; end: string;
  baseCapacity: number; extraPerson: number;
}) {
  const nights = daysBetween(start, end);
  if (nights <= 0) return null;

  const calc = priceVilla({
    pricePerNight, start, end,
    pax: baseCapacity + extraPerson, baseCapacity,
  });

  return (
    <div className="text-sm border border-[var(--line)] rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span>Harga kamar ({nights} malam)</span>
        <span className="font-medium">{formatRupiah(pricePerNight * nights)}</span>
      </div>
      {extraPerson > 0 && (
        <div className="flex items-center justify-between mt-1">
          <span>Extra person ({extraPerson} × {nights} malam × {formatRupiah(EXTRA_PERSON_FEE)})</span>
          <span className="font-medium">{formatRupiah(extraPerson * nights * EXTRA_PERSON_FEE)}</span>
        </div>
      )}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--line)]">
        <span>Subtotal</span>
        <span className="font-semibold">{formatRupiah(calc.subtotal)}</span>
      </div>
      <div className="text-xs text-[var(--muted)] mt-1">Harga sudah termasuk pajak/biaya (mock).</div>
    </div>
  );
}

function HourBasedBreakdown({
  kind, unitPrice, hours,
}: { kind: "jeep" | "transport" | "dokumentasi"; unitPrice: number; hours: number }) {
  const calc = kind === "jeep"
    ? priceJeep({ pricePerHour: unitPrice, hours: Math.max(1, hours) })
    : kind === "dokumentasi"
    ? priceDokumentasi({ pricePerHour: unitPrice, hours: Math.max(1, hours) })
    : priceTransport({ pricePerRoute: unitPrice });

  return (
    <div className="text-sm border border-[var(--line)] rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span>{kind === "transport" ? "Harga per rute" : `Harga dasar ${Math.max(1, hours)} jam`}</span>
        <span className="font-medium">{formatRupiah(calc.subtotal)}</span>
      </div>
      <div className="text-xs text-[var(--muted)] mt-1">Harga sudah termasuk pajak/biaya (mock).</div>
    </div>
  );
}
