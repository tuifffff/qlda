import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const current = items.find((x) => x.versionId === item.versionId);
        if (current) {
          set({
            items: items.map((x) =>
              x.versionId === item.versionId
                ? { ...x, quantity: Math.min(x.quantity + item.quantity, x.stock) }
                : x,
            ),
          });
          return;
        }
        set({ items: [...items, item] });
      },
      updateQuantity: (versionId, quantity) =>
        set({
          items: get().items.map((item) =>
            item.versionId === versionId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
              : item,
          ),
        }),
      removeItem: (versionId) =>
        set({ items: get().items.filter((item) => item.versionId !== versionId) }),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'selling-phone-cart' },
  ),
);
