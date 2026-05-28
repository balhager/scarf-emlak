import { create } from 'zustand';

export interface CanvasItemState {
  id: string;
  wardrobeItemId: string;
  imageUri: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface CanvasState {
  items: CanvasItemState[];
  activeItemId: string | null;
  addToCanvas: (wardrobeItemId: string, imageUri: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateScale: (id: string, scale: number) => void;
  bringToFront: (id: string) => void;
  setActiveItem: (id: string | null) => void;
  removeFromCanvas: (id: string) => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>()((set, get) => ({
  items: [],
  activeItemId: null,

  addToCanvas: (wardrobeItemId, imageUri) => {
    const maxZ = get().items.reduce((max, i) => Math.max(max, i.zIndex), 0);
    set((s) => ({
      items: [
        ...s.items,
        {
          id: `ci-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          wardrobeItemId,
          imageUri,
          x: 100 + Math.random() * 80,
          y: 120 + Math.random() * 80,
          scale: 1,
          rotation: 0,
          zIndex: maxZ + 1,
        },
      ],
    }));
  },

  updatePosition: (id, x, y) =>
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, x, y } : i)) })),

  updateScale: (id, scale) =>
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, scale } : i)) })),

  bringToFront: (id) => {
    const maxZ = get().items.reduce((max, i) => Math.max(max, i.zIndex), 0);
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, zIndex: maxZ + 1 } : i)),
    }));
  },

  setActiveItem: (id) => set({ activeItemId: id }),
  removeFromCanvas: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clearCanvas: () => set({ items: [], activeItemId: null }),
}));
