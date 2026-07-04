import { create } from "zustand";

export type PosCartLine = {
  key: string;
  productId: number;
  variantId: number | null;
  name: string;
  variantLabel: string | null;
  sku: string | null;
  image: string | null;
  unitPrice: number;
  stock: number;
  quantity: number;
};

function lineKey(productId: number, variantId: number | null) {
  return `${productId}-${variantId ?? "base"}`;
}

type PosCartState = {
  lines: PosCartLine[];
  addLine: (line: Omit<PosCartLine, "key" | "quantity">, qty?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  grandTotal: () => number;
  toPayload: () => { productId: number; variantId: number | null; quantity: number }[];
};

export const usePosCartStore = create<PosCartState>((set, get) => ({
  lines: [],
  addLine: (line, qty = 1) => {
    const key = lineKey(line.productId, line.variantId);
    set((state) => {
      const existing = state.lines.find((l) => l.key === key);
      if (existing) {
        const nextQty = Math.min(existing.stock, existing.quantity + qty);
        if (nextQty <= 0) return state;
        return {
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: nextQty } : l
          ),
        };
      }
      const quantity = Math.min(line.stock, qty);
      if (quantity <= 0) return state;
      return {
        lines: [...state.lines, { ...line, key, quantity }],
      };
    });
  },
  setQuantity: (key, quantity) => {
    set((state) => ({
      lines: state.lines
        .map((l) =>
          l.key === key ? { ...l, quantity: Math.min(l.stock, Math.max(0, quantity)) } : l
        )
        .filter((l) => l.quantity > 0),
    }));
  },
  removeLine: (key) => {
    set((state) => ({ lines: state.lines.filter((l) => l.key !== key) }));
  },
  clear: () => set({ lines: [] }),
  grandTotal: () =>
    get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
  toPayload: () =>
    get().lines.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      quantity: l.quantity,
    })),
}));
