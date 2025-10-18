import { Hero } from "@/components/home/hero";
import { PromoSection } from "@/components/home/promo-section";
import { RecommendSection } from "@/components/home/recommend-section";
import { InfoHowTo } from "@/components/home/info-howto";
import { InfoRating } from "@/components/home/info-rating";
import { InfoContact } from "@/components/home/info-contact";
import { features } from "@/lib/config";
import { listTrending, listPromos } from "@/lib/api/catalog";

export default async function HomePage() {
  const [topVilla, topJeep, topRent, topDoc] = await Promise.all([
    listTrending({ type: "villa",       limit: 4 }),
    listTrending({ type: "jeep",        limit: 4 }),
    listTrending({ type: "transport",   limit: 4 }),
    listTrending({ type: "dokumentasi", limit: 4 }),
  ]);

  const promos = features.showPromoPackages ? await listPromos() : [];

  return (
    <>
      <Hero />
      {features.showPromoPackages && promos.length > 0 && <PromoSection promos={promos} />}
      <RecommendSection title="Villa Rekomendasi" items={topVilla} />
      <RecommendSection title="Jeep Rekomendasi" items={topJeep} />
      <RecommendSection title="Rent Rekomendasi" items={topRent} />
      <RecommendSection title="Dokumentasi Rekomendasi" items={topDoc} />
      <InfoHowTo />
      <InfoRating />
      <InfoContact />
    </>
  );
}
