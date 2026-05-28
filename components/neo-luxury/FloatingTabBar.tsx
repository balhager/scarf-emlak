import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Grid2X2, Plus, User } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';

const TABS = [
  { name: 'index', label: 'VAULT', Icon: Home },
  { name: 'canvas', label: 'CANVAS', Icon: Grid2X2 },
  { name: 'add', label: 'ADD', Icon: Plus },
  { name: 'profile', label: 'PROFILE', Icon: User },
];

interface Props {
  state: any;
  navigation: any;
}

export const FloatingTabBar: React.FC<Props> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 12 }]}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.inner}>
          {TABS.map((tab, index) => {
            const isFocused = state.index === index;
            const isAdd = tab.name === 'add';
            const { Icon } = tab;
            const color = isFocused ? Colors.accent : Colors.muted;

            const onPress = () => {
              haptics.selection();
              const event = navigation.emit({
                type: 'tabPress',
                target: state.routes[index]?.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            };

            return (
              <Pressable
                key={tab.name}
                onPress={onPress}
                style={[styles.tab, isAdd && styles.addTab]}
              >
                {isAdd ? (
                  <View style={styles.addButton}>
                    <Icon size={18} color={Colors.background} strokeWidth={2} />
                  </View>
                ) : (
                  <>
                    <Icon size={18} color={color} strokeWidth={isFocused ? 2 : 1.5} />
                    <Text style={[styles.label, { color }]}>{tab.label}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  blurContainer: {
    borderRadius: 24,
  },
  inner: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  addTab: {
    flex: 0,
    width: 56,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.label,
    fontSize: 8,
  },
});
