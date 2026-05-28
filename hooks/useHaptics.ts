import * as Haptics from 'expo-haptics';

export const useHaptics = () => ({
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  selection: () => Haptics.selectionAsync(),
  notify: (type: Haptics.NotificationFeedbackType) =>
    Haptics.notificationAsync(type),
});
