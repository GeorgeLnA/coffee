import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type CartItem = {
  id: string; // unique key for a product + options
  productId: string;
  name: string;
  image?: string;
  price: number; // unit price in local currency
  quantity: number;
  // Optional options
  variant?: string; // e.g., size like 5L / 20L or weight
  type?: "coffee" | "water" | "other";
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  totalQuantity: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "manifest_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: CartItem[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(Boolean);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore persistence errors
    }
  }, [items]);

  const addItem: CartContextValue["addItem"] = (incoming) => {
    const id = incoming.id ?? `${incoming.productId}|${incoming.variant ?? "default"}`;
    setItems((prev) => {
      const existingIndex = prev.findIndex((it) => it.id === id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (incoming.quantity || 1),
        };
        return updated;
      }
      const newItem: CartItem = {
        id,
        productId: incoming.productId,
        name: incoming.name,
        image: incoming.image,
        price: incoming.price,
        quantity: incoming.quantity || 1,
        variant: incoming.variant,
        type: incoming.type,
      };
      return [...prev, newItem];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (id, quantity) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(1, quantity) } : it)));
  };

  const clear: CartContextValue["clear"] = () => setItems([]);

  const { totalQuantity, totalPrice } = useMemo(() => {
    const totals = items.reduce(
      (acc, it) => {
        acc.totalQuantity += it.quantity;
        acc.totalPrice += it.quantity * it.price;
        return acc;
      },
      { totalQuantity: 0, totalPrice: 0 }
    );
    return totals;
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    totalQuantity,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


