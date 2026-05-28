import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Dimensions } from 'react-native';
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

const Z_NORMALIZE_THRESHOLD = 50;

function normalizedZIndex(items: CanvasItemState[], bringId: string): CanvasItemState[] {
  const sorted = [...items].sort((a, b) => a.zIndex - b.zIndex);
  return sorted.map((item, idx) => ({
    ...item,
    zIndex: item.id === bringId ? sorted.length : idx,
  }));
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      items: [],
      activeItemId: null,
      savedLooks: [],

      addToCanvas: (wardrobeItemId, imageUri) => {
        const { width, height } = Dimensions.get('window');
        const canvasHeight = height * 0.52;
        // Spawn items in the visible center area of the canvas
        const centerX = width / 2;
        const centerY = canvasHeight / 2;
        const maxZ = get().items.reduce((max, i) => Math.max(max, i.zIndex), 0);
        set((s) => ({
          items: [
            ...s.items,
            {
              id: `ci-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              wardrobeItemId,
              imageUri,
              x: centerX + (Math.random() - 0.5) * 120,
              y: centerY + (Math.random() - 0.5) * 100,
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
        set((s) => {
          const maxZ = s.items.reduce((m, i) => Math.max(m, i.zIndex), 0);
          // Normalize z-index to prevent unbounded growth
          if (maxZ >= Z_NORMALIZE_THRESHOLD) {
            return { items: normalizedZIndex(s.items, id) };
          }
          return {
            items: s.items.map((i) => (i.id === id ? { ...i, zIndex: maxZ + 1 } : i)),
          };
        });
      },

      setActiveItem: (id) => set({ activeItemId: id }),
      removeFromCanvas: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
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
        if (!look) return;
        // Regenerate IDs so React always remounts CanvasItem components,
        // preventing stale shared value positions when the same IDs exist on canvas.
        const freshItems = look.items.map((i) => ({
          ...i,
          id: `ci-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        }));
        set({ items: freshItems, activeItemId: null });
      },

      deleteLook: (lookId) =>
        set((s) => ({ savedLooks: s.savedLooks.filter((l) => l.id !== lookId) })),
    }),
    {
      name: 'canvas-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist saved looks; canvas resets intentionally each session.
      partialize: (state) => ({ savedLooks: state.savedLooks }),
    }
  )
);
