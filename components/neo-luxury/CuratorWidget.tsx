import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

const CURATOR_EDITORIALS = [
  {
    headline: 'THE QUIET LUXURY SHIFT',
    body: 'This season, your wardrobe signals restraint. The overcoat and wide-leg trouser speak louder than any logo ever could.',
  },
  {
    headline: 'MONOCHROME TENSION',
    body: 'Three shades of black — one in wool, one in leather, one in silk. The outfit finds its power in texture, not contrast.',
  },
  {
    headline: 'THE CAPSULE PARADOX',
    body: '20 pieces. 400 outfits. The mathematics of considered dressing dissolves the anxiety of the full wardrobe.',
  },
  {
    headline: 'THERMAL ARCHITECTURE',
    body: "Today's biting cold demands layering precision. Matte down over cashmere turtleneck — warmth as invisible structure.",
  },
  {
    headline: 'VELOCITY DRESSING',
    body: 'Aerodynamic leather and wind-breaking layers for the open road. Function elevated to editorial.',
  },
  {
    headline: 'THE SUNDAY EDIT',
    body: 'Unstructured blazer, relaxed trouser, clean sneaker. The luxury of looking effortless is the highest effort of all.',
  },
  {
    headline: 'AFTER DARK',
    body: 'Midnight demands a different grammar. The silk tank under the overcoat — a studied contradiction that works.',
  },
];

const getEditorial = () =>
  CURATOR_EDITORIALS[new Date().getDay() % CURATOR_EDITORIALS.length];

export const CuratorWidget: React.FC = () => {
  const editorial = getEditorial();

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.pillLabel}>AI CURATOR — TODAY'S DIRECTIVE</Text>
      </View>
      <Text style={styles.headline}>{editorial.headline}</Text>
      <Text style={styles.body}>{editorial.body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accent,
    marginBottom: Spacing.sm,
  },
  pillLabel: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 8,
  },
  headline: {
    ...Typography.label,
    color: Colors.white,
    fontSize: 11,
    marginBottom: Spacing.sm,
  },
  body: {
    ...Typography.body,
  },
});
