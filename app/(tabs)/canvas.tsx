import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { RotateCcw, Bookmark } from 'lucide-react-native';
import { CanvasItem } from '@/components/neo-luxury/CanvasItem';
import { BottomSheet } from '@/components/neo-luxury/BottomSheet';
import { useCanvasStore, type SavedLook } from '@/store/canvasStore';
import { useWardrobeStore, type WardrobeItem } from '@/store/wardrobeStore';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

const { width, height } = Dimensions.get('window');
const CANVAS_HEIGHT = height * 0.52;
const THUMB_SIZE = 72;
const LOOK_CARD_SIZE = 72;

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const canvasItems   = useCanvasStore((s) => s.items);
  const savedLooks    = useCanvasStore((s) => s.savedLooks);
  const addToCanvas   = useCanvasStore((s) => s.addToCanvas);
  const clearCanvas   = useCanvasStore((s) => s.clearCanvas);
  const saveLook      = useCanvasStore((s) => s.saveLook);
  const loadLook      = useCanvasStore((s) => s.loadLook);
  const deleteLook    = useCanvasStore((s) => s.deleteLook);
  const wardrobeItems = useWardrobeStore((s) => s.items);

  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [lookName, setLookName] = useState('');

  const handleAddItem = useCallback(
    (item: WardrobeItem) => {
      haptics.medium();
      addToCanvas(item.id, item.imageUri);
    },
    [addToCanvas, haptics]
  );

  const handleClear = useCallback(() => {
    if (canvasItems.length === 0) return;
    Alert.alert('Clear Canvas', 'Remove all items from the canvas?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { haptics.heavy(); clearCanvas(); } },
    ]);
  }, [canvasItems.length, clearCanvas, haptics]);

  const handleSaveLook = useCallback(() => {
    const name = lookName.trim() || 'Untitled Look';
    saveLook(name);
    setLookName('');
    setSaveSheetOpen(false);
    haptics.medium();
  }, [lookName, saveLook, haptics]);

  const handleLoadLook = useCallback(
    (look: SavedLook) => {
      Alert.alert('Load Look', `Load "${look.name}"? Current canvas will be replaced.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => {
            haptics.medium();
            loadLook(look.id);
          },
        },
      ]);
    },
    [loadLook, haptics]
  );

  const handleDeleteLook = useCallback(
    (look: SavedLook) => {
      Alert.alert('Delete Look', `Delete "${look.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => { haptics.heavy(); deleteLook(look.id); },
        },
      ]);
    },
    [deleteLook, haptics]
  );

  const renderThumb = useCallback(
    ({ item }: { item: WardrobeItem }) => (
      <Pressable onPress={() => handleAddItem(item)} style={styles.thumbnail}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.thumbImage}
          contentFit="cover"
          transition={200}
        />
      </Pressable>
    ),
    [handleAddItem]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>CANVAS</Text>
          {canvasItems.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{canvasItems.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              if (canvasItems.length === 0) return;
              setSaveSheetOpen(true);
              haptics.light();
            }}
            style={styles.headerBtn}
          >
            <Bookmark
              size={14}
              color={canvasItems.length > 0 ? Colors.accent : Colors.muted}
              strokeWidth={1.5}
            />
            <Text
              style={[
                styles.headerBtnLabel,
                canvasItems.length > 0 && { color: Colors.accent },
              ]}
            >
              SAVE
            </Text>
          </Pressable>
          <Pressable onPress={handleClear} style={styles.headerBtn}>
            <RotateCcw size={14} color={Colors.muted} strokeWidth={1.5} />
            <Text style={styles.headerBtnLabel}>CLEAR</Text>
          </Pressable>
        </View>
      </View>

      {/* Canvas Workspace */}
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

      {/* Saved Looks Strip */}
      {savedLooks.length > 0 && (
        <>
          <View style={styles.stripSection}>
            <Text style={styles.sectionLabel}>SAVED LOOKS</Text>
            <FlashList
              horizontal
              data={savedLooks}
              keyExtractor={(l) => l.id}
              estimatedItemSize={LOOK_CARD_SIZE + 28}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.looksContent}
              renderItem={({ item: look }) => (
                <Pressable
                  onPress={() => handleLoadLook(look)}
                  onLongPress={() => handleDeleteLook(look)}
                  delayLongPress={500}
                  style={styles.lookCard}
                >
                  <View style={styles.lookPreview}>
                    {look.previewUris.slice(0, 3).map((uri, i) => (
                      <Image
                        key={i}
                        source={{ uri }}
                        style={[styles.lookThumb, { left: i * 18, zIndex: i }]}
                        contentFit="cover"
                      />
                    ))}
                  </View>
                  <Text style={styles.lookName} numberOfLines={1}>{look.name}</Text>
                </Pressable>
              )}
            />
          </View>
          <View style={styles.divider} />
        </>
      )}

      {/* Wardrobe Strip — FlashList horizontal for better performance */}
      <View style={styles.stripSection}>
        <Text style={styles.sectionLabel}>WARDROBE</Text>
        <FlashList
          horizontal
          data={wardrobeItems}
          keyExtractor={(i) => i.id}
          estimatedItemSize={THUMB_SIZE + 8}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wardrobeContent}
          renderItem={renderThumb}
        />
      </View>

      {/* Save Look Sheet */}
      <BottomSheet
        open={saveSheetOpen}
        onClose={() => { setSaveSheetOpen(false); setLookName(''); }}
        snapHeight={300}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.saveSheet}
        >
          <Text style={styles.saveSheetTitle}>NAME THIS LOOK</Text>
          <TextInput
            style={styles.saveInput}
            placeholder="UNTITLED LOOK"
            placeholderTextColor={Colors.muted}
            value={lookName}
            onChangeText={setLookName}
            autoCapitalize="words"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSaveLook}
            maxLength={40}
          />
          <Pressable style={styles.saveBtn} onPress={handleSaveLook}>
            <Text style={styles.saveBtnText}>SAVE LOOK</Text>
          </Pressable>
        </KeyboardAvoidingView>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { ...Typography.logo },
  countBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.background,
    letterSpacing: 0.5,
  },
  headerActions: { flexDirection: 'row', gap: 20 },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerBtnLabel: { ...Typography.label, color: Colors.muted },
  canvas: {
    width,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
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
    opacity: 0.25,
    fontSize: 14,
    letterSpacing: 4,
  },
  emptyHint: { ...Typography.label, opacity: 0.18, fontSize: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  stripSection: { paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  sectionLabel: {
    ...Typography.label,
    paddingHorizontal: Spacing.md,
    marginBottom: 10,
  },
  looksContent: { paddingHorizontal: Spacing.md },
  lookCard: {
    alignItems: 'center',
    width: LOOK_CARD_SIZE + 20,
    marginRight: 8,
  },
  lookPreview: {
    width: LOOK_CARD_SIZE,
    height: LOOK_CARD_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    marginBottom: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  lookThumb: {
    position: 'absolute',
    width: LOOK_CARD_SIZE * 0.65,
    height: LOOK_CARD_SIZE * 0.65,
    top: 4,
    borderRadius: 1,
  },
  lookName: {
    ...Typography.label,
    fontSize: 8,
    textAlign: 'center',
    maxWidth: LOOK_CARD_SIZE + 20,
  },
  wardrobeContent: { paddingHorizontal: Spacing.md },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginRight: 8,
  },
  thumbImage: { width: '100%', height: '100%' },
  saveSheet: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  saveSheetTitle: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  saveInput: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.accent,
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 1,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
    marginTop: Spacing.md,
  },
  saveBtnText: {
    ...Typography.label,
    color: Colors.background,
    fontWeight: '700',
    fontSize: 11,
  },
});
