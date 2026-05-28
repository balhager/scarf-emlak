import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';
import type { WardrobeCategory } from '@/store/wardrobeStore';

export interface FilterGroup {
  label: string;
  categories: WardrobeCategory[] | null;
}

export const FILTER_GROUPS: FilterGroup[] = [
  { label: 'ALL', categories: null },
  { label: 'OUTERWEAR', categories: ['jacket', 'coat', 'blazer'] },
  { label: 'TOPS', categories: ['shirt', 'turtleneck', 'tank'] },
  { label: 'BOTTOMS', categories: ['trouser', 'denim', 'shorts'] },
  { label: 'FOOTWEAR', categories: ['boots', 'loafer', 'sneaker'] },
  { label: 'ACCESSORIES', categories: ['bag', 'belt', 'watch'] },
];

const FilterPill: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 15, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
        onPress={() => { haptics.light(); onPress(); }}
        style={[styles.pill, active && styles.pillActive]}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

interface Props {
  activeLabel: string;
  onChange: (group: FilterGroup) => void;
}

export const CategoryFilter: React.FC<Props> = ({ activeLabel, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
    bounces={false}
  >
    {FILTER_GROUPS.map((group) => (
      <FilterPill
        key={group.label}
        label={group.label}
        active={activeLabel === group.label}
        onPress={() => onChange(group)}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  pillText: {
    ...Typography.label,
    fontSize: 9,
  },
  pillTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
});
