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
import { Colors, Typography, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const BAR_MAX_WIDTH = width - Spacing.md * 2 - 80;

const CATEGORY_GROUPS = [
  { label: 'OUTERWEAR', categories: ['jacket', 'coat', 'blazer'] },
  { label: 'TOPS', categories: ['shirt', 'turtleneck', 'tank'] },
  { label: 'BOTTOMS', categories: ['trouser', 'denim', 'shorts'] },
  { label: 'FOOTWEAR', categories: ['boots', 'loafer', 'sneaker'] },
  { label: 'ACCESSORIES', categories: ['bag', 'belt', 'watch'] },
];

const AnimatedBar: React.FC<{ pct: number; delay: number }> = ({ pct, delay }) => {
  const barWidth = useSharedValue(0);
  const barStyle = useAnimatedStyle(() => ({ width: barWidth.value }));

  useEffect(() => {
    barWidth.value = withDelay(delay, withTiming(BAR_MAX_WIDTH * pct, { duration: 700 }));
  }, [pct]);

  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, barStyle]} />
    </View>
  );
};

const barStyles = StyleSheet.create({
  track: {
    height: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const items = useWardrobeStore((s) => s.items);
  const savedLooks = useCanvasStore((s) => s.savedLooks);

  const stats = useMemo(() => {
    if (items.length === 0) return null;

    const brands = [...new Set(items.map((i) => i.brand))];

    const brandCounts = brands
      .map((b) => ({ name: b, count: items.filter((i) => i.brand === b).length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const categoryBreakdown = CATEGORY_GROUPS.map((g) => {
      const count = items.filter((i) => (g.categories as string[]).includes(i.category)).length;
      return { label: g.label, count };
    });
    const maxCat = Math.max(...categoryBreakdown.map((c) => c.count), 1);

    const sorted = [...items].sort((a, b) => b.addedAt - a.addedAt);
    const recent = sorted.slice(0, 5);

    const oldest = [...items].sort((a, b) => a.addedAt - b.addedAt)[0];
    const wardrobeAgeDays = Math.round((Date.now() - oldest.addedAt) / 86400000);

    return { brands, brandCounts, categoryBreakdown, maxCat, recent, wardrobeAgeDays };
  }, [items]);

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
          <StatCard label="PIECES" value={items.length.toString()} />
          <StatCard label="BRANDS" value={stats ? stats.brands.length.toString() : '0'} />
          <StatCard label="LOOKS" value={savedLooks.length.toString()} />
          <StatCard
            label="WARDROBE AGE"
            value={stats ? `${stats.wardrobeAgeDays}D` : '0D'}
          />
        </View>

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

        {/* Recent Additions */}
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
                  <Text style={styles.recentBrand} numberOfLines={1}>
                    {item.brand}
                  </Text>
                  <Text style={styles.recentName} numberOfLines={1}>
                    {item.name}
                  </Text>
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
                <Text style={styles.brandRank}>0{i + 1}</Text>
                <Text style={styles.brandName}>{b.name}</Text>
                <Text style={styles.brandCount}>{b.count} {b.count === 1 ? 'PIECE' : 'PIECES'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>V—ARCH</Text>
          <Text style={styles.signatureSubtext}>THE DIGITAL WARDROBE</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  logo: { ...Typography.logo },
  scrollContent: { paddingBottom: 140 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    gap: 1,
  },
  statCard: {
    width: '50%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'flex-start',
    marginBottom: -StyleSheet.hairlineWidth,
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
  barLabel: {
    ...Typography.label,
    fontSize: 8,
    width: 80,
  },
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
  brandRank: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 9,
    width: 24,
  },
  brandName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 1,
    color: Colors.white,
  },
  brandCount: { ...Typography.label, fontSize: 9 },
  signature: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: 6,
  },
  signatureText: {
    ...Typography.logo,
    opacity: 0.15,
    fontSize: 20,
  },
  signatureSubtext: {
    ...Typography.label,
    opacity: 0.1,
    fontSize: 8,
  },
});
