import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WardrobeCard } from '@/components/neo-luxury/WardrobeCard';
import { CuratorWidget } from '@/components/neo-luxury/CuratorWidget';
import { useWardrobeStore, type WardrobeItem } from '@/store/wardrobeStore';
import { Colors, Typography, Spacing } from '@/constants/theme';

const CARD_HEIGHTS = [220, 280, 240, 300, 210, 260];

type ListItem = WardrobeItem | { _type: 'header' };

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const items = useWardrobeStore((s) => s.items);

  const getCardHeight = (index: number) => CARD_HEIGHTS[index % CARD_HEIGHTS.length];

  const data: ListItem[] = [{ _type: 'header' }, ...items];

  const renderItem = useCallback(({ item, index }: { item: ListItem; index: number }) => {
    if ('_type' in item && item._type === 'header') {
      return <CuratorWidget />;
    }
    const wardrobeItem = item as WardrobeItem;
    return (
      <WardrobeCard
        item={wardrobeItem}
        height={getCardHeight(index - 1)}
      />
    );
  }, []);

  const getItemType = (item: ListItem) => {
    if ('_type' in item && item._type === 'header') return 'header';
    return 'item';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BlurView intensity={90} tint="dark" style={styles.header}>
        <Text style={styles.logo}>V—ARCH</Text>
        <Text style={styles.itemCount}>{items.length} PIECES</Text>
      </BlurView>

      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={250}
        numColumns={2}
        getItemType={getItemType}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) =>
          '_type' in item ? 'header' : (item as WardrobeItem).id
        }
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
  itemCount: {
    ...Typography.label,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 120,
  },
});
