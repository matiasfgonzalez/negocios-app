// lib/store/cart.ts
import { create } from "zustand";

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((s) => {
      const exists = s.items.find((i) => i.productId === item.productId);
      if (exists) {
        return {
          items: s.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...s.items, item] };
    }),
  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  updateQty: (productId, qty) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ),
    })),
  clear: () => set({ items: [] }),
  subtotal: () =>
    get().items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
}));
