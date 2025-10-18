export type ProductType = "villa" | "jeep" | "transport" | "dokumentasi";
export type ProductUnit = "malam" | "jam" | "rute";

export type SortKey = "popular" | "price-asc" | "price-desc" | "rating-desc";

export interface RentMeta {
  minDays?: number;
  graceHours?: number;
  operatingHours?: { start: number; end: number; stepMinutes?: number };
}

export interface ProductPolicy {
  checkin?: string;
  checkout?: string;
  taxInclusive?: boolean;    // default true di UI
  refundDeduction?: number;  // 0.2 = 20%
}

export interface Product {
  id: string;
  type: ProductType;
  slug: string;
  name: string;

  location?: string;
  price: number;
  unit?: ProductUnit;
  published: boolean;
  rating?: number;
  trending?: boolean;

  // Detail opsional
  images?: string[];
  description?: string;
  amenities?: string[];
  policy?: ProductPolicy;

  // Parameter khusus villa (opsional)
  baseCapacity?: number;     // default 2 di UI
  extraPersonFee?: number;   // default 200_000
  extraMax?: number;         // default 4
  maxOccupancy?: number;     // default baseCapacity + extraMax

  rentMeta?: RentMeta;
}
