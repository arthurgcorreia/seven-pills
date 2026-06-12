import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '../types';

export interface AppliedCoupon {
  code: string;
  discountPercent: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  discountValue: number;
  total: number;
  requiresPrescription: boolean;
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
  clearCart: () => void;
}

interface StoredCart {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
}

const STORAGE_KEY = 'seven-pills-cart';

const CartContext = createContext<CartContextValue | null>(null);

function loadStoredCart(): StoredCart {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredCart;
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        appliedCoupon: parsed.appliedCoupon ?? null,
      };
    }
  } catch {
    // Estado corrompido no localStorage: recomeça com carrinho vazio.
  }
  return { items: [], appliedCoupon: null };
}

function clampQuantity(quantity: number, maxPerOrder: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) return 1;
  return Math.min(Math.floor(quantity), maxPerOrder);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [stored] = useState(loadStoredCart);
  const [items, setItems] = useState<CartItem[]>(stored.items);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    stored.appliedCoupon
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, appliedCoupon }));
  }, [items, appliedCoupon]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    // Mesma fórmula do backend (server/rules.js): arredonda apenas o total
    // final, para o checkout e a confirmação exibirem o mesmo valor cobrado.
    const discountPercent = appliedCoupon?.discountPercent ?? 0;
    const total = Math.round(subtotal * (1 - discountPercent / 100) * 100) / 100;
    const discountValue = Math.round((subtotal - total) * 100) / 100;

    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      appliedCoupon,
      discountValue,
      total,
      requiresPrescription: items.some((item) => item.product.requiresPrescription),
      addItem: (product, quantity) =>
        setItems((prev) => {
          const existing = prev.find((item) => item.product.id === product.id);
          if (existing) {
            const merged = clampQuantity(
              existing.quantity + quantity,
              product.maxPerOrder
            );
            return prev.map((item) =>
              item.product.id === product.id ? { ...item, quantity: merged } : item
            );
          }
          return [...prev, { product, quantity: clampQuantity(quantity, product.maxPerOrder) }];
        }),
      updateQuantity: (productId, quantity) =>
        setItems((prev) =>
          prev.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: clampQuantity(quantity, item.product.maxPerOrder) }
              : item
          )
        ),
      removeItem: (productId) =>
        setItems((prev) => prev.filter((item) => item.product.id !== productId)),
      applyCoupon: setAppliedCoupon,
      clearCart: () => {
        setItems([]);
        setAppliedCoupon(null);
      },
    };
  }, [items, appliedCoupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de <CartProvider>');
  }
  return context;
}
