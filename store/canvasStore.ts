import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'canvas-store' });
const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

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

export interface SavedLook {
  id: string;
  name: string;
  previewUris: string[];
  items: CanvasItemState[];
  createdAt: number;
}

interface CanvasState {
  items: CanvasItemState[];
  activeItemId: string | null;
  savedLooks: SavedLook[];
  addToCanvas: (wardrobeItemId: string, imageUri: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateScale: (id: string, scale: number) => void;
  bringToFront: (id: string) => void;
  setActiveItem: (id: string | null) => void;
  removeFromCanvas: (id: string) => void;
  clearCanvas: () => void;
  saveLook: (name: string) => void;
  loadLook: (lookId: string) => void;
  deleteLook: (lookId: string) => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      items: [],
      activeItemId: null,
      savedLooks: [],

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

      saveLook: (name) => {
        const { items } = get();
        if (items.length === 0) return;
        const look: SavedLook = {
          id: `look-${Date.now()}`,
          name,
          previewUris: items.slice(0, 3).map((i) => i.imageUri),
          items: [...items],
          createdAt: Date.now(),
        };
        set((s) => ({ savedLooks: [look, ...s.savedLooks] }));
      },

      loadLook: (lookId) => {
        const look = get().savedLooks.find((l) => l.id === lookId);
        if (look) set({ items: [...look.items], activeItemId: null });
      },

      deleteLook: (lookId) =>
        set((s) => ({ savedLooks: s.savedLooks.filter((l) => l.id !== lookId) })),
    }),
    {
      name: 'canvas-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ savedLooks: state.savedLooks }),
    }
  )
);
