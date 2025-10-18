import type { CartItem } from "./cart";

const KEY = "checkout_draft";

export function setCheckoutDraft(item: CartItem): void {
  localStorage.setItem(KEY, JSON.stringify(item));
}

export function getCheckoutDraft(): CartItem | null {
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as CartItem) : null;
  } catch {
    return null;
  }
}
