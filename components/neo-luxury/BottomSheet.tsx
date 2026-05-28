import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPRING = { damping: 22, stiffness: 200 };

interface Props {
  open: boolean;
  onClose: () => void;
  snapHeight?: number;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<Props> = ({
  open,
  onClose,
  snapHeight = SCREEN_HEIGHT * 0.6,
  children,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(snapHeight);
  const backdropOpacity = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setModalVisible(true);
      translateY.value = withSpring(0, SPRING);
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(snapHeight, SPRING, (done) => {
        if (done) runOnJS(setModalVisible)(false);
      });
      backdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [open]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > snapHeight * 0.3 || e.velocityY > 800) {
        translateY.value = withSpring(snapHeight, SPRING);
        backdropOpacity.value = withTiming(0, { duration: 180 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, { height: snapHeight }, sheetStyle]}>
            <View style={styles.handle} />
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  handle: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.muted,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
    opacity: 0.35,
  },
});
