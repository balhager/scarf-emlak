import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useWardrobeStore, type WardrobeItem } from '@/store/wardrobeStore';

const FALLBACK_EDITORIALS = [
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

function getPersonalizedEditorial(items: WardrobeItem[]): { headline: string; body: string } {
  const day = new Date().getDay();

  if (items.length === 0) {
    return FALLBACK_EDITORIALS[day % FALLBACK_EDITORIALS.length];
  }

  const totalWears = items.reduce((sum, i) => sum + (i.wornCount ?? 0), 0);
  const coats = items.filter((i) => ['coat', 'jacket', 'blazer'].includes(i.category));
  const tops = items.filter((i) => ['turtleneck', 'shirt', 'tank'].includes(i.category));
  const footwear = items.filter((i) => ['boots', 'loafer', 'sneaker'].includes(i.category));

  const brandCounts = new Map<string, number>();
  items.forEach((i) => brandCounts.set(i.brand, (brandCounts.get(i.brand) ?? 0) + 1));
  const dominantBrand = [...brandCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const personalized: ({ headline: string; body: string } | null)[] = [
    coats.length > 0 && tops.length > 0
      ? {
          headline: 'THE LAYER PROPOSITION',
          body: `The ${coats[0].name} over the ${tops[0].name}. A conversation in textures that resolves into something inevitable.`,
        }
      : null,

    totalWears > 0
      ? {
          headline: 'THE WORN ARCHIVE',
          body: `${totalWears} wear${totalWears === 1 ? '' : 's'} logged across ${items.length} pieces. The most used items reveal what you actually believe in.`,
        }
      : null,

    items.length >= 15
      ? {
          headline: 'THE EDIT IS COHERENT',
          body: `${items.length} pieces. Not one unnecessary. The wardrobe has reached a density that makes choice effortless.`,
        }
      : null,

    dominantBrand && brandCounts.get(dominantBrand)! > 1
      ? {
          headline: `THE ${dominantBrand.toUpperCase()} THREAD`,
          body: `${brandCounts.get(dominantBrand)} pieces from ${dominantBrand}. A loyalty that implies conviction, not collection.`,
        }
      : null,

    footwear.length > 0 && coats.length > 0
      ? {
          headline: 'FROM GROUND TO COLLAR',
          body: `${footwear[0].name} anchors the silhouette. ${coats[0].name} closes it. What happens between is entirely yours.`,
        }
      : null,
  ];

  const valid = personalized.filter(Boolean) as { headline: string; body: string }[];
  const pool = [...valid, ...FALLBACK_EDITORIALS];
  return pool[day % pool.length];
}

export const CuratorWidget: React.FC = () => {
  const items = useWardrobeStore((s) => s.items);
  const editorial = getPersonalizedEditorial(items);

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
