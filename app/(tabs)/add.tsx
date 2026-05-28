import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon } from 'lucide-react-native';
import { CategoryFilter, FILTER_GROUPS, type FilterGroup } from '@/components/neo-luxury/CategoryFilter';
import { useWardrobeStore, type WardrobeCategory } from '@/store/wardrobeStore';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

const CATEGORY_MAP: Record<string, WardrobeCategory[]> = {
  OUTERWEAR: ['jacket', 'coat', 'blazer'],
  TOPS: ['shirt', 'turtleneck', 'tank'],
  BOTTOMS: ['trouser', 'denim', 'shorts'],
  FOOTWEAR: ['boots', 'loafer', 'sneaker'],
  ACCESSORIES: ['bag', 'belt', 'watch'],
};

const INITIAL_FILTER = FILTER_GROUPS[1]; // OUTERWEAR

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const addItem = useWardrobeStore((s) => s.addItem);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [categoryGroup, setCategoryGroup] = useState<FilterGroup>(INITIAL_FILTER);

  const pickFromLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo access in Settings to add wardrobe items.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled) {
      haptics.light();
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled) {
      haptics.light();
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!imageUri || !brand.trim() || !name.trim()) {
      Alert.alert('Missing Info', 'Please select a photo, enter a brand, and name the item.');
      return;
    }

    const categoryList = CATEGORY_MAP[categoryGroup.label];
    const category: WardrobeCategory = categoryList?.[0] ?? 'jacket';

    addItem({
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      brand: brand.trim(),
      category,
      color: color.trim() || 'Unknown',
      imageUri,
      addedAt: Date.now(),
    });

    haptics.medium();

    // Reset form
    setImageUri(null);
    setBrand('');
    setName('');
    setColor('');
    setCategoryGroup(INITIAL_FILTER);

    Alert.alert('Added', `"${name.trim()}" has been added to your wardrobe.`);
  }, [imageUri, brand, name, color, categoryGroup, addItem]);

  const canSave = !!imageUri && brand.trim().length > 0 && name.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>ADD PIECE</Text>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
        >
          <Text style={[styles.saveBtnText, !canSave && styles.saveBtnTextDisabled]}>
            SAVE
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Picker */}
          <View style={styles.photoSection}>
            {imageUri ? (
              <Pressable onPress={pickFromLibrary} style={styles.photoPreview}>
                <Image source={{ uri: imageUri }} style={styles.photo} contentFit="cover" />
                <View style={styles.photoOverlay}>
                  <Text style={styles.photoChangeLabel}>CHANGE PHOTO</Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.photoPlaceholder}>
                <View style={styles.photoActions}>
                  <Pressable onPress={pickFromLibrary} style={styles.photoAction}>
                    <ImageIcon size={22} color={Colors.accent} strokeWidth={1.5} />
                    <Text style={styles.photoActionLabel}>LIBRARY</Text>
                  </Pressable>
                  <View style={styles.photoActionDivider} />
                  <Pressable onPress={pickFromCamera} style={styles.photoAction}>
                    <Camera size={22} color={Colors.accent} strokeWidth={1.5} />
                    <Text style={styles.photoActionLabel}>CAMERA</Text>
                  </Pressable>
                </View>
                <Text style={styles.photoHint}>SELECT A PHOTO TO BEGIN</Text>
              </View>
            )}
          </View>

          {/* Form */}
          <View style={styles.form}>
            <LuxuryField
              label="BRAND"
              placeholder="e.g. Rick Owens"
              value={brand}
              onChangeText={setBrand}
              autoCapitalize="words"
            />
            <LuxuryField
              label="ITEM NAME"
              placeholder="e.g. Boxy Leather Jacket"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <LuxuryField
              label="COLOR"
              placeholder="e.g. Onyx, Ivory, Camel"
              value={color}
              onChangeText={setColor}
              autoCapitalize="words"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <CategoryFilter
                activeLabel={categoryGroup.label}
                onChange={setCategoryGroup}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const LuxuryField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  autoCapitalize?: 'none' | 'words' | 'sentences';
}> = ({ label, placeholder, value, onChangeText, autoCapitalize = 'none' }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.fieldInput}
      placeholder={placeholder}
      placeholderTextColor={Colors.muted}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize}
      returnKeyType="next"
    />
    <View style={styles.fieldUnderline} />
  </View>
);

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
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  saveBtnDisabled: { backgroundColor: 'transparent', borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  saveBtnText: { ...Typography.label, color: Colors.background, fontWeight: '700' },
  saveBtnTextDisabled: { color: Colors.muted },
  scrollContent: { paddingBottom: 120 },
  photoSection: { marginHorizontal: Spacing.md, marginTop: Spacing.md },
  photoPreview: {
    height: 280,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  photo: { width: '100%', height: '100%' },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  photoChangeLabel: { ...Typography.label, fontSize: 9 },
  photoPlaceholder: {
    height: 220,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  photoAction: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  photoActionLabel: { ...Typography.label, color: Colors.accent, fontSize: 9 },
  photoActionDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: Colors.border,
  },
  photoHint: { ...Typography.label, opacity: 0.3, fontSize: 8 },
  form: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { ...Typography.label, fontSize: 9, color: Colors.accent },
  fieldInput: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.5,
    paddingVertical: 6,
  },
  fieldUnderline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
});
