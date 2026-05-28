import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';
import type { WardrobeItem } from '@/store/wardrobeStore';

interface Props {
  item: WardrobeItem;
  height: number;
  onPress?: (item: WardrobeItem) => void;
  onLongPress?: (item: WardrobeItem) => void;
}

export const WardrobeCard: React.FC<Props> = ({ item, height, onPress, onLongPress }) => {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    haptics.light();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const handleLongPress = useCallback(() => {
    haptics.medium();
    onLongPress?.(item);
  }, [item, onLongPress]);

  return (
    <Animated.View entering={FadeIn.duration(250)} style={[styles.card, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress?.(item)}
        onLongPress={handleLongPress}
        delayLongPress={380}
        style={{ flex: 1 }}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={[styles.image, { height }]}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.meta}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.color}>{item.color}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    backgroundColor: Colors.surface,
  },
  meta: {
    padding: Spacing.sm,
    paddingTop: 10,
    paddingBottom: 12,
  },
  brand: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: 3,
  },
  name: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  color: {
    ...Typography.label,
    marginTop: 4,
  },
});
