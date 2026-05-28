import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useCanvasStore, type CanvasItemState } from '@/store/canvasStore';
import { useHaptics } from '@/hooks/useHaptics';

const ITEM_SIZE = 180;

interface Props {
  item: CanvasItemState;
}

export const CanvasItem: React.FC<Props> = ({ item }) => {
  const haptics = useHaptics();
  const { updatePosition, updateScale, bringToFront, setActiveItem } = useCanvasStore();

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
      runOnJS(haptics.light)();
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
      runOnJS(haptics.light)();
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={combinedGesture}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          { zIndex: item.zIndex },
        ]}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={styles.image}
          contentFit="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginLeft: -ITEM_SIZE / 2,
    marginTop: -ITEM_SIZE / 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
