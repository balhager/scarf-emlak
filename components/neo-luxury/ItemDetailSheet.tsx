import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { BottomSheet } from './BottomSheet';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';
import { useWardrobeStore, type WardrobeItem } from '@/store/wardrobeStore';
import { useCanvasStore } from '@/store/canvasStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_HEIGHT = SCREEN_HEIGHT * 0.72;

interface Props {
  item: WardrobeItem | null;
  onClose: () => void;
}

export const ItemDetailSheet: React.FC<Props> = ({ item, onClose }) => {
  const haptics = useHaptics();
  const removeItem = useWardrobeStore((s) => s.removeItem);
  const addToCanvas = useCanvasStore((s) => s.addToCanvas);

  const handleAddToCanvas = useCallback(() => {
    if (!item) return;
    haptics.medium();
    addToCanvas(item.id, item.imageUri);
    onClose();
  }, [item]);

  const handleRemove = useCallback(() => {
    if (!item) return;
    Alert.alert(
      'Remove from Wardrobe',
      `Remove "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            haptics.heavy();
            removeItem(item.id);
            onClose();
          },
        },
      ]
    );
  }, [item]);

  const addedDate = item
    ? new Date(item.addedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <BottomSheet open={!!item} onClose={onClose} snapHeight={SNAP_HEIGHT}>
      {item && (
        <ScrollView
          style={{ flex: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />

          <View style={styles.meta}>
            <Text style={styles.brand}>{item.brand}</Text>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.chips}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{item.category.toUpperCase()}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>{item.color.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.date}>ADDED {addedDate.toUpperCase()}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.primaryBtn} onPress={handleAddToCanvas}>
              <Text style={styles.primaryBtnText}>ADD TO CANVAS</Text>
            </Pressable>
            <Pressable style={styles.destructiveBtn} onPress={handleRemove}>
              <Text style={styles.destructiveBtnText}>REMOVE FROM WARDROBE</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 240,
    backgroundColor: Colors.background,
  },
  meta: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  brand: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 1,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  chipText: {
    ...Typography.label,
    fontSize: 9,
  },
  date: {
    ...Typography.label,
    marginTop: 6,
    opacity: 0.35,
  },
  actions: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 2,
  },
  primaryBtnText: {
    ...Typography.label,
    color: Colors.background,
    fontWeight: '700',
    fontSize: 11,
  },
  destructiveBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,80,80,0.25)',
  },
  destructiveBtnText: {
    ...Typography.label,
    color: 'rgba(255,80,80,0.6)',
    fontSize: 10,
  },
});
