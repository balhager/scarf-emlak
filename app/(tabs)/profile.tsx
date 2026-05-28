import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useWardrobeStore } from '@/store/wardrobeStore';
import { useCanvasStore } from '@/store/canvasStore';
import { Colors, Typography, Spacing, Animation } from '@/constants/theme';

const { width } = Dimensions.get('window');
const BAR_MAX_WIDTH = width - Spacing.md * 2 - 96;

const CATEGORY_GROUPS = [
  { label: 'OUTERWEAR',  categories: ['jacket', 'coat', 'blazer'] },
  { label: 'TOPS',       categories: ['shirt', 'turtleneck', 'tank'] },
  { label: 'BOTTOMS',    categories: ['trouser', 'denim', 'shorts'] },
  { label: 'FOOTWEAR',   categories: ['boots', 'loafer', 'sneaker'] },
  { label: 'ACCESSORIES',categories: ['bag', 'belt', 'watch'] },
];

const AnimatedBar: React.FC<{ pct: number; delay: number }> = ({ pct, delay }) => {
  const barWidth = useSharedValue(0);
  const barStyle = useAnimatedStyle(() => ({ width: barWidth.value }));

  useEffect(() => {
    barWidth.value = withDelay(delay, withTiming(BAR_MAX_WIDTH * pct, { duration: Animation.slow }));
  }, [pct]);

  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, barStyle]} />
    </View>
  );
};

const barStyles = StyleSheet.create({
  track: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.borderSubtle,
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 1 },
});

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const items = useWardrobeStore((s) => s.items);
  const savedLooks = useCanvasStore((s) => s.savedLooks);

  const stats = useMemo(() => {
    if (items.length === 0) return null;

    // Single pass for brand counts and total wears
    const brandMap = new Map<string, number>();
    let totalWears = 0;
    items.forEach((i) => {
      brandMap.set(i.brand, (brandMap.get(i.brand) ?? 0) + 1);
      totalWears += i.wornCount ?? 0;
    });

    const brandCounts = [...brandMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const categoryBreakdown = CATEGORY_GROUPS.map((g) => ({
      label: g.label,
      count: items.filter((i) => (g.categories as string[]).includes(i.category)).length,
    }));
    const maxCat = Math.max(...categoryBreakdown.map((c) => c.count), 1);

    const mostWorn = [...items]
      .filter((i) => (i.wornCount ?? 0) > 0)
      .sort((a, b) => (b.wornCount ?? 0) - (a.wornCount ?? 0))
      .slice(0, 5);

    const recent = [...items].sort((a, b) => b.addedAt - a.addedAt).slice(0, 5);

    const oldestAddedAt = Math.min(...items.map((i) => i.addedAt));
    const wardrobeAgeDays = Math.max(0, Math.round((Date.now() - oldestAddedAt) / 86400000));

    return {
      totalBrands: brandMap.size,
      brandCounts,
      categoryBreakdown,
      maxCat,
      totalWears,
      mostWorn,
      recent,
      wardrobeAgeDays,
    };
  }, [items]);

  // Empty state
  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.logo}>PROFILE</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>THE WARDROBE</Text>
          <Text style={styles.emptyHint}>
            ADD YOUR FIRST PIECE VIA THE + TAB{'\n'}TO BEGIN BUILDING YOUR COLLECTION
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>PROFILE</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard label="PIECES"      value={items.length.toString()} />
          <StatCard label="BRANDS"      value={stats ? stats.totalBrands.toString() : '0'} />
          <StatCard label="LOOKS SAVED" value={savedLooks.length.toString()} />
          <StatCard label="TOTAL WEARS" value={stats ? stats.totalWears.toString() : '0'} />
        </View>

        {/* Most Worn */}
        {stats && stats.mostWorn.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOST WORN</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentContent}
            >
              {stats.mostWorn.map((item) => (
                <View key={item.id} style={styles.recentCard}>
                  <View>
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.recentImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.wornOverlay}>
                      <Text style={styles.wornOverlayText}>×{item.wornCount}</Text>
                    </View>
                  </View>
                  <Text style={styles.recentBrand} numberOfLines={1}>{item.brand}</Text>
                  <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Breakdown */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WARDROBE BREAKDOWN</Text>
            {stats.categoryBreakdown.map((cat, i) => (
              <View key={cat.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{cat.label}</Text>
                <AnimatedBar pct={cat.count / stats.maxCat} delay={i * 80} />
                <Text style={styles.barCount}>{cat.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recently Added */}
        {stats && stats.recent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENTLY ADDED</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentContent}
            >
              {stats.recent.map((item) => (
                <View key={item.id} style={styles.recentCard}>
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.recentImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <Text style={styles.recentBrand} numberOfLines={1}>{item.brand}</Text>
                  <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Top Brands */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TOP BRANDS</Text>
            {stats.brandCounts.map((b, i) => (
              <View key={b.name} style={styles.brandRow}>
                <Text style={styles.brandRank}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.brandName}>{b.name}</Text>
                <Text style={styles.brandCount}>
                  {b.count} {b.count === 1 ? 'PIECE' : 'PIECES'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Wardrobe Age Hero */}
        {stats && (
          <View style={styles.ageBlock}>
            <Text style={styles.ageLabel}>WARDROBE AGE</Text>
            <Text style={styles.ageValue}>{stats.wardrobeAgeDays}</Text>
            <Text style={styles.ageDaysLabel}>
              {stats.wardrobeAgeDays === 1 ? 'DAY' : 'DAYS'} OF CURATION
            </Text>
          </View>
        )}

        <View style={styles.signature}>
          <Text style={styles.signatureText}>V—ARCH</Text>
          <Text style={styles.signatureSubtext}>THE DIGITAL WARDROBE</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  logo: { ...Typography.logo },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.logo,
    opacity: 0.15,
    fontSize: 20,
  },
  emptyHint: {
    ...Typography.label,
    opacity: 0.25,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 16,
  },
  scrollContent: { paddingBottom: 140 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: StyleSheet.hairlineWidth,
  },
  statCard: {
    width: '50%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '200',
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 4,
  },
  statLabel: { ...Typography.label, fontSize: 8 },
  section: {
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 12,
  },
  barLabel: { ...Typography.label, fontSize: 8, width: 88 },
  barCount: {
    ...Typography.label,
    fontSize: 9,
    color: Colors.white,
    width: 16,
    textAlign: 'right',
  },
  recentContent: { gap: 10 },
  recentCard: {
    width: 110,
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  recentImage: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.background,
  },
  wornOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accent,
  },
  wornOverlayText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    color: Colors.accent,
  },
  recentBrand: {
    ...Typography.label,
    color: Colors.accent,
    paddingHorizontal: 8,
    paddingTop: 7,
    fontSize: 8,
  },
  recentName: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '300',
    paddingHorizontal: 8,
    paddingBottom: 8,
    letterSpacing: 0.3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: 14,
  },
  brandRank: { ...Typography.label, color: Colors.accent, fontSize: 9, width: 24 },
  brandName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 1,
    color: Colors.white,
  },
  brandCount: { ...Typography.label, fontSize: 9 },
  ageBlock: {
    marginTop: Spacing.xxl,
    marginHorizontal: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  ageLabel: { ...Typography.label, marginBottom: Spacing.sm },
  ageValue: {
    fontSize: 64,
    fontWeight: '100',
    color: Colors.white,
    letterSpacing: -2,
    lineHeight: 72,
  },
  ageDaysLabel: { ...Typography.label, opacity: 0.35, marginTop: 4 },
  signature: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: 6,
  },
  signatureText: { ...Typography.logo, opacity: 0.12, fontSize: 20 },
  signatureSubtext: { ...Typography.label, opacity: 0.08, fontSize: 8 },
});
