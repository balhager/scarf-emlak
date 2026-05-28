import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Search, X, SlidersHorizontal, Shuffle } from 'lucide-react-native';
import { router } from 'expo-router';
import { WardrobeCard } from '@/components/neo-luxury/WardrobeCard';
import { CuratorWidget } from '@/components/neo-luxury/CuratorWidget';
import { CategoryFilter, FILTER_GROUPS, type FilterGroup } from '@/components/neo-luxury/CategoryFilter';
import { ItemDetailSheet } from '@/components/neo-luxury/ItemDetailSheet';
import { BottomSheet } from '@/components/neo-luxury/BottomSheet';
import { useWardrobeStore, type WardrobeItem } from '@/store/wardrobeStore';
import { useCanvasStore } from '@/store/canvasStore';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

const CARD_HEIGHTS = [220, 280, 240, 300, 210, 260];

type SortKey = 'recent' | 'brand' | 'worn';
const SORT_OPTIONS: { key: SortKey; label: string; sub: string }[] = [
  { key: 'recent', label: 'RECENTLY ADDED', sub: 'Newest items first' },
  { key: 'brand', label: 'BRAND A—Z', sub: 'Alphabetical by designer' },
  { key: 'worn', label: 'MOST WORN', sub: 'By wear count' },
];

const OUTFIT_GROUPS = [
  ['jacket', 'coat', 'blazer'],
  ['shirt', 'turtleneck', 'tank'],
  ['trouser', 'denim', 'shorts'],
  ['boots', 'loafer', 'sneaker'],
];

type ListItem = WardrobeItem | { _type: 'header' };

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const allItems = useWardrobeStore((s) => s.items);
  const addToCanvas = useCanvasStore((s) => s.addToCanvas);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);

  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterGroup>(FILTER_GROUPS[0]);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [sortOpen, setSortOpen] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const searchBarHeight = useSharedValue(0);
  const searchBarOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(1);

  const openSearch = useCallback(() => {
    setSearching(true);
    searchBarHeight.value = withSpring(50, { damping: 18, stiffness: 200 });
    searchBarOpacity.value = withTiming(1, { duration: 200 });
    logoOpacity.value = withTiming(0.3, { duration: 150 });
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const closeSearch = useCallback(() => {
    setSearching(false);
    setSearchQuery('');
    Keyboard.dismiss();
    searchBarHeight.value = withSpring(0, { damping: 18, stiffness: 200 });
    searchBarOpacity.value = withTiming(0, { duration: 150 });
    logoOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const searchBarStyle = useAnimatedStyle(() => ({
    height: searchBarHeight.value,
    opacity: searchBarOpacity.value,
    overflow: 'hidden',
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const filteredItems = useMemo(() => {
    let result = allItems;
    if (activeFilter.categories) {
      result = result.filter((i) => activeFilter.categories!.includes(i.category));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.color.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allItems, activeFilter, searchQuery]);

  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    if (sortBy === 'brand') arr.sort((a, b) => a.brand.localeCompare(b.brand));
    else if (sortBy === 'worn') arr.sort((a, b) => (b.wornCount ?? 0) - (a.wornCount ?? 0));
    else arr.sort((a, b) => b.addedAt - a.addedAt);
    return arr;
  }, [filteredItems, sortBy]);

  const handleShuffle = useCallback(() => {
    haptics.heavy();
    clearCanvas();
    let added = 0;
    OUTFIT_GROUPS.forEach((cats) => {
      const pool = allItems.filter((i) => (cats as string[]).includes(i.category));
      if (pool.length === 0) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      addToCanvas(pick.id, pick.imageUri);
      added++;
    });
    if (added > 0) router.navigate('/(tabs)/canvas');
  }, [allItems, addToCanvas, clearCanvas]);

  const getCardHeight = (index: number) => CARD_HEIGHTS[index % CARD_HEIGHTS.length];
  const data: ListItem[] = [{ _type: 'header' }, ...sortedItems];

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      if ('_type' in item) return <CuratorWidget />;
      return (
        <WardrobeCard
          item={item as WardrobeItem}
          height={getCardHeight(index - 1)}
          onLongPress={setSelectedItem}
        />
      );
    },
    []
  );

  const getItemType = (item: ListItem) => ('_type' in item ? 'header' : 'item');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Glassmorphism Header */}
      <BlurView intensity={90} tint="dark" style={styles.header}>
        <Animated.Text style={[styles.logo, logoStyle]}>V—ARCH</Animated.Text>
        <View style={styles.headerRight}>
          <Text style={styles.itemCount}>{sortedItems.length}</Text>
          <Pressable onPress={handleShuffle} style={styles.iconBtn} hitSlop={6}>
            <Shuffle size={15} color={Colors.muted} strokeWidth={1.5} />
          </Pressable>
          <Pressable
            onPress={() => { setSortOpen(true); haptics.light(); }}
            style={styles.iconBtn}
            hitSlop={6}
          >
            <SlidersHorizontal
              size={15}
              color={sortBy !== 'recent' ? Colors.accent : Colors.muted}
              strokeWidth={1.5}
            />
          </Pressable>
          <Pressable
            onPress={searching ? closeSearch : openSearch}
            style={styles.iconBtn}
            hitSlop={6}
          >
            {searching
              ? <X size={15} color={Colors.muted} strokeWidth={1.5} />
              : <Search size={15} color={Colors.muted} strokeWidth={1.5} />
            }
          </Pressable>
        </View>
      </BlurView>

      {/* Animated Search Bar */}
      <Animated.View style={[styles.searchBarWrapper, searchBarStyle]}>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="SEARCH BRAND, ITEM, COLOR..."
          placeholderTextColor={Colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
      </Animated.View>

      {/* Category Filter */}
      <CategoryFilter activeLabel={activeFilter.label} onChange={setActiveFilter} />
      <View style={styles.divider} />

      {/* Wardrobe Grid */}
      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={250}
        numColumns={2}
        getItemType={getItemType}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => ('_type' in item ? 'header' : (item as WardrobeItem).id)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO ITEMS FOUND</Text>
          </View>
        }
      />

      {/* Item Detail Sheet */}
      <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Sort Sheet */}
      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} snapHeight={290}>
        <View style={styles.sortSheet}>
          <Text style={styles.sortTitle}>SORT BY</Text>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => {
                setSortBy(opt.key);
                setSortOpen(false);
                haptics.selection();
              }}
              style={styles.sortOption}
            >
              <View style={styles.sortOptionLeft}>
                <Text style={[styles.sortOptionLabel, sortBy === opt.key && styles.sortOptionActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.sortOptionSub}>{opt.sub}</Text>
              </View>
              {sortBy === opt.key && (
                <View style={styles.sortDot} />
              )}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  logo: { ...Typography.logo },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  itemCount: { ...Typography.label, fontSize: 9 },
  iconBtn: { padding: 2 },
  searchBarWrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },
  emptyState: { paddingTop: 80, alignItems: 'center' },
  emptyText: { ...Typography.label, opacity: 0.25 },
  sortSheet: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sortTitle: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.lg,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sortOptionLeft: { gap: 4 },
  sortOptionLabel: { ...Typography.label, fontSize: 11, color: Colors.muted },
  sortOptionActive: { color: Colors.white },
  sortOptionSub: { ...Typography.label, fontSize: 8, opacity: 0.4 },
  sortDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});
