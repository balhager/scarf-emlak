import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X } from 'lucide-react-native';
import { useCanvasStore, type CanvasItemState } from '@/store/canvasStore';
import { useHaptics } from '@/hooks/useHaptics';
import { Colors } from '@/constants/theme';

const ITEM_SIZE = 180;

interface Props {
  item: CanvasItemState;
}

export const CanvasItem: React.FC<Props> = ({ item }) => {
  const haptics = useHaptics();
  const { updatePosition, updateScale, bringToFront, setActiveItem, removeFromCanvas } =
    useCanvasStore();

  const translateX = useSharedValue(item.x);
  const translateY = useSharedValue(item.y);
  const scale = useSharedValue(item.scale);
  const startX = useSharedValue(item.x);
  const startY = useSharedValue(item.y);
  const baseScale = useSharedValue(item.scale);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(bringToFront)(item.id);
      runOnJS(setActiveItem)(item.id);
      // Arrow-function wrapper prevents 'this' context loss on the UI thread
      runOnJS(() => haptics.light())();
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(updatePosition)(item.id, translateX.value, translateY.value);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.3, Math.min(3, baseScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(updateScale)(item.id, scale.value);
      runOnJS(() => haptics.light())();
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleDelete = useCallback(() => {
    haptics.heavy();
    removeFromCanvas(item.id);
  }, [item.id, removeFromCanvas, haptics]);

  return (
    <Animated.View style={[styles.outerContainer, animatedStyle, { zIndex: item.zIndex }]}>
      <GestureDetector gesture={combinedGesture}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="contain" />
        </View>
      </GestureDetector>

      {/* Delete button sits outside GestureDetector to receive its own press events */}
      <Pressable style={styles.deleteBtn} onPress={handleDelete} hitSlop={8}>
        <View style={styles.deleteDot}>
          <X size={9} color={Colors.background} strokeWidth={2.5} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginLeft: -ITEM_SIZE / 2,
    marginTop: -ITEM_SIZE / 2,
  },
  imageContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
    padding: 2,
  },
  deleteDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});
