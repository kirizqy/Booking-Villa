"use client";

import { useMemo, useState } from "react";

export function ProductGallery({ images }: { images?: string[] }) {
  // gunakan 5 placeholder jika belum ada gambar
  const fallback = useMemo(() => Array.from({ length: 5 }, () => ""), []);
  const pics = images?.length ? images : fallback;
  const [active, setActive] = useState(0);

  return (
    <section aria-label="Galeri" className="space-y-3">
      {pics[active] ? (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--line)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pics[active]} alt={`Foto ${active + 1}`} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[16/9] rounded-2xl skel" />
      )}

      <div className="grid grid-cols-5 gap-2">
        {pics.map((src, i) => (
          <button
            key={`thumb-${i}`}
            onClick={() => setActive(i)}
            aria-label={`Foto ${i + 1}`}
            className={[
              "aspect-[16/10] rounded-lg overflow-hidden border",
              active === i ? "border-[var(--brand-600)]" : "border-[var(--line)]",
            ].join(" ")}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full skel" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
