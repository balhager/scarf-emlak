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
import { Search, X } from 'lucide-react-native';
import { WardrobeCard } from '@/components/neo-luxury/WardrobeCard';
import { CuratorWidget } from '@/components/neo-luxury/CuratorWidget';
import { CategoryFilter, FILTER_GROUPS, type FilterGroup } from '@/components/neo-luxury/CategoryFilter';
import { ItemDetailSheet } from '@/components/neo-luxury/ItemDetailSheet';
import { useWardrobeStore, type WardrobeItem } from '@/store/wardrobeStore';
import { Colors, Typography, Spacing } from '@/constants/theme';

const CARD_HEIGHTS = [220, 280, 240, 300, 210, 260];
type ListItem = WardrobeItem | { _type: 'header' };

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const allItems = useWardrobeStore((s) => s.items);

  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterGroup>(FILTER_GROUPS[0]);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

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

  const getCardHeight = (index: number) => CARD_HEIGHTS[index % CARD_HEIGHTS.length];
  const data: ListItem[] = [{ _type: 'header' }, ...filteredItems];

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

  const getItemType = (item: ListItem) =>
    '_type' in item ? 'header' : 'item';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Glassmorphism Header */}
      <BlurView intensity={90} tint="dark" style={styles.header}>
        <Animated.Text style={[styles.logo, logoStyle]}>V—ARCH</Animated.Text>
        <View style={styles.headerRight}>
          <Text style={styles.itemCount}>{filteredItems.length} PIECES</Text>
          <Pressable onPress={searching ? closeSearch : openSearch} style={styles.searchBtn}>
            {searching
              ? <X size={16} color={Colors.muted} strokeWidth={1.5} />
              : <Search size={16} color={Colors.muted} strokeWidth={1.5} />
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
      <CategoryFilter
        activeLabel={activeFilter.label}
        onChange={setActiveFilter}
      />

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
      <ItemDetailSheet
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  logo: {
    ...Typography.logo,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemCount: {
    ...Typography.label,
  },
  searchBtn: {
    padding: 2,
  },
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },
  emptyState: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.label,
    opacity: 0.25,
  },
});
