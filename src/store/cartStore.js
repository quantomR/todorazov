import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { brand } from '@/config/brand';

/**
 * Cart lines are full snapshots keyed by lineId (product|color|size) —
 * see src/lib/cart.js. priceEur is resolved at add time
 * (color override ?? product base price).
 */
const useCartStore = create(
	persist(
		(set, get) => ({
			items: [],

			addItem: (item) =>
				set((state) => {
					const existing = state.items.find((i) => i.lineId === item.lineId);
					if (existing) {
						return {
							items: state.items.map((i) =>
								i.lineId === item.lineId ? { ...i, qty: i.qty + item.qty } : i
							),
						};
					}
					return { items: [...state.items, item] };
				}),

			removeItem: (lineId) =>
				set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

			updateQty: (lineId, qty) =>
				set((state) => ({
					items:
						qty < 1
							? state.items
							: state.items.map((i) => (i.lineId === lineId ? { ...i, qty } : i)),
				})),

			clearCart: () => set({ items: [] }),

			totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

			totalEur: () => get().items.reduce((sum, i) => sum + i.priceEur * i.qty, 0),
		}),
		{ name: `${brand.storageKeyPrefix}-cart` }
	)
);

export default useCartStore;
