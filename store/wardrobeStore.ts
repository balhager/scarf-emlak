import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'wardrobe-store' });

const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export type WardrobeCategory =
  | 'jacket' | 'coat' | 'blazer'
  | 'shirt' | 'turtleneck' | 'tank'
  | 'trouser' | 'denim' | 'shorts'
  | 'boots' | 'loafer' | 'sneaker'
  | 'bag' | 'belt' | 'watch';

export interface WardrobeItem {
  id: string;
  name: string;
  brand: string;
  category: WardrobeCategory;
  color: string;
  imageUri: string;
  addedAt: number;
  wornCount?: number;
}

const DUMMY_ITEMS: WardrobeItem[] = [
  {
    id: 'w01',
    name: 'Double-Breasted Overcoat',
    brand: 'Loro Piana',
    category: 'coat',
    color: 'Camel',
    imageUri: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e4?w=600&q=80',
    addedAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'w02',
    name: 'Boxy Leather Jacket',
    brand: 'Rick Owens',
    category: 'jacket',
    color: 'Onyx',
    imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    addedAt: Date.now() - 86400000 * 25,
  },
  {
    id: 'w03',
    name: 'Wool Melton Blazer',
    brand: 'Toteme',
    category: 'blazer',
    color: 'Charcoal',
    imageUri: 'https://images.unsplash.com/photo-1594938298603-c8148c4f9cc8?w=600&q=80',
    addedAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'w04',
    name: 'Trench Coat',
    brand: 'Burberry',
    category: 'coat',
    color: 'Honey',
    imageUri: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&q=80',
    addedAt: Date.now() - 86400000 * 18,
  },
  {
    id: 'w05',
    name: 'Cashmere Turtleneck',
    brand: 'Brunello Cucinelli',
    category: 'turtleneck',
    color: 'Ivory',
    imageUri: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
    addedAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'w06',
    name: 'Oxford Poplin Shirt',
    brand: 'Tekla',
    category: 'shirt',
    color: 'Cloud',
    imageUri: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    addedAt: Date.now() - 86400000 * 14,
  },
  {
    id: 'w07',
    name: 'Silk Slip Tank',
    brand: 'Vince',
    category: 'tank',
    color: 'Champagne',
    imageUri: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80',
    addedAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'w08',
    name: 'Merino Crew Knit',
    brand: 'Auralee',
    category: 'shirt',
    color: 'Sand',
    imageUri: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80',
    addedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'w09',
    name: 'Wide-Leg Trousers',
    brand: 'The Row',
    category: 'trouser',
    color: 'Slate',
    imageUri: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    addedAt: Date.now() - 86400000 * 9,
  },
  {
    id: 'w10',
    name: 'Straight-Cut Selvedge',
    brand: 'Kapital',
    category: 'denim',
    color: 'Indigo',
    imageUri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
    addedAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'w11',
    name: 'Pleated Wool Trousers',
    brand: 'Brioni',
    category: 'trouser',
    color: 'Espresso',
    imageUri: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
    addedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'w12',
    name: 'Track Shorts',
    brand: 'Satisfy',
    category: 'shorts',
    color: 'Obsidian',
    imageUri: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80',
    addedAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'w13',
    name: 'Side-Zip Chelsea Boots',
    brand: 'Common Projects',
    category: 'boots',
    color: 'Black',
    imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    addedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'w14',
    name: 'Horsebit Loafer',
    brand: 'Gucci',
    category: 'loafer',
    color: 'Cognac',
    imageUri: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80',
    addedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'w15',
    name: 'Low Achilles Sneaker',
    brand: 'Common Projects',
    category: 'sneaker',
    color: 'White',
    imageUri: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80',
    addedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'w16',
    name: 'Ankle Boot',
    brand: 'Celine',
    category: 'boots',
    color: 'Stone',
    imageUri: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    addedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'w17',
    name: 'Bottega Pouch',
    brand: 'Bottega Veneta',
    category: 'bag',
    color: 'Clay',
    imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    addedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'w18',
    name: 'Braided Belt',
    brand: 'Bottega Veneta',
    category: 'belt',
    color: 'Chocolate',
    imageUri: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    addedAt: Date.now() - 86400000,
  },
  {
    id: 'w19',
    name: 'Royal Oak',
    brand: 'Audemars Piguet',
    category: 'watch',
    color: 'Steel',
    imageUri: 'https://images.unsplash.com/photo-1523170335258-f05e2caea0a7?w=600&q=80',
    addedAt: Date.now() - 3600000,
  },
  {
    id: 'w20',
    name: 'Tote Bag',
    brand: 'The Row',
    category: 'bag',
    color: 'Ecru',
    imageUri: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
    addedAt: Date.now() - 1800000,
  },
];

interface WardrobeState {
  items: WardrobeItem[];
  addItem: (item: WardrobeItem) => void;
  removeItem: (id: string) => void;
  markAsWorn: (id: string) => void;
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set) => ({
      items: DUMMY_ITEMS,
      addItem: (item) => set((s) => ({ items: [item, ...s.items] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      markAsWorn: (id) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, wornCount: (i.wornCount ?? 0) + 1 } : i
          ),
        })),
    }),
    {
      name: 'wardrobe-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
