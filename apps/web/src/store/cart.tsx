"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem =
  | { id: string; kind:"villa"; productId:string; name:string; pricePerNight:number; start:string; end:string; pax:number; baseCapacity:number }
  | { id: string; kind:"jeep"; productId:string; name:string; pricePerHour:number; date:string; time:string; hours:number }
  | { id: string; kind:"transport"; productId:string; name:string; pricePerRoute:number; date:string; route?:string }
  | { id: string; kind:"dokumentasi"; productId:string; name:string; pricePerHour:number; date:string; time:string; hours:number; packagePrice?:number };

// input tanpa id
export type CartInput =
  | Omit<Extract<CartItem, {kind:"villa"}>, "id">
  | Omit<Extract<CartItem, {kind:"jeep"}>, "id">
  | Omit<Extract<CartItem, {kind:"transport"}>, "id">
  | Omit<Extract<CartItem, {kind:"dokumentasi"}>, "id">;

type Ctx = {
  items: CartItem[];
  add: (i: CartInput) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try { const raw = localStorage.getItem("cart:v1"); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("cart:v1", JSON.stringify(items)); }, [items]);

  const api: Ctx = useMemo(() => ({
    items,
    add: (i) => {
      const item: CartItem = { ...i, id: crypto.randomUUID() } as CartItem; // tegaskan union → CartItem
      setItems(prev => [...prev, item]);
    },
    remove: (id) => setItems(prev => prev.filter(x => x.id !== id)),
    clear: () => setItems([])
  }), [items]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
