import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { RotateCcw } from 'lucide-react-native';
import { CanvasItem } from '@/components/neo-luxury/CanvasItem';
import { useCanvasStore } from '@/store/canvasStore';
import { useWardrobeStore, type WardrobeItem } from '@/store/wardrobeStore';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

const { width, height } = Dimensions.get('window');
const CANVAS_HEIGHT = height * 0.58;
const THUMB_SIZE = 72;

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const canvasItems = useCanvasStore((s) => s.items);
  const addToCanvas = useCanvasStore((s) => s.addToCanvas);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);
  const wardrobeItems = useWardrobeStore((s) => s.items);

  const handleAddItem = useCallback((item: WardrobeItem) => {
    haptics.medium();
    addToCanvas(item.id, item.imageUri);
  }, [addToCanvas]);

  const handleClear = useCallback(() => {
    haptics.heavy();
    clearCanvas();
  }, [clearCanvas]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>CANVAS</Text>
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <RotateCcw size={14} color={Colors.muted} strokeWidth={1.5} />
          <Text style={styles.clearLabel}>CLEAR</Text>
        </Pressable>
      </View>

      <View style={[styles.canvas, { height: CANVAS_HEIGHT }]}>
        {canvasItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>YOUR CANVAS</Text>
            <Text style={styles.emptyHint}>TAP AN ITEM BELOW TO PLACE IT</Text>
          </View>
        )}
        {[...canvasItems]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((item) => (
            <CanvasItem key={item.id} item={item} />
          ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>WARDROBE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.panelContent}
        >
          {wardrobeItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleAddItem(item)}
              style={styles.thumbnail}
            >
              <Image
                source={{ uri: item.imageUri }}
                style={styles.thumbImage}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearLabel: {
    ...Typography.label,
  },
  canvas: {
    width,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    ...Typography.label,
    color: Colors.muted,
    opacity: 0.3,
    fontSize: 14,
    letterSpacing: 4,
  },
  emptyHint: {
    ...Typography.label,
    opacity: 0.2,
    fontSize: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  panel: {
    flex: 1,
    paddingTop: Spacing.sm,
    paddingBottom: 120,
  },
  panelLabel: {
    ...Typography.label,
    paddingHorizontal: Spacing.md,
    marginBottom: 10,
  },
  panelContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
});
