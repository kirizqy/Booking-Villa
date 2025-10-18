export type CartItem = {
  id: string;
  type: "villa" | "jeep" | "transport" | "dokumentasi";
  productId: string;
  name: string;
  image?: string;
  unitPrice: number;
  params: {
    start?: string; end?: string;
    date?: string; time?: string;
    baseGuests?: number; extraGuests?: number;
  };
  pricing: {
    nights?: number; hours?: number;
    subtotal: number;
    breakdown: Array<{ label: string; amount: number }>;
  };
};

const KEY = "cart_items";

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem): void {
  const list = getCart();
  list.push(item);
  localStorage.setItem(KEY, JSON.stringify(list));
}
