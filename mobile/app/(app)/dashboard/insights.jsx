import React, { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import useDashboardStore from '../../../src/store/useDashboardStore';
import AppLoader from '../../../src/components/common/AppLoader';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius } from '../../../src/theme/spacing';

export default function InsightsScreen() {
  const { mlInsights, fetchMlInsights, isLoading } = useDashboardStore();

  useEffect(() => { fetchMlInsights(); }, []);

  if (isLoading && !mlInsights) return <AppLoader fullScreen />;

  const { demand = [], segments = {}, pricing = [], margins = [] } = mlInsights || {};

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>ML Insights</Text>

        {/* Demand Predictions */}
        <Text style={styles.section}>Demand Predictions</Text>
        {demand.map((d, i) => (
          <AppCard key={i} style={styles.card}>
            <Text style={styles.product}>{d.product}</Text>
            <Text style={styles.units}>Expected to sell: {d.expectedUnits} units</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${d.confidence * 100}%`, backgroundColor: Colors.success }]} />
            </View>
            <Text style={styles.confidence}>{(d.confidence * 100).toFixed(0)}% confidence</Text>
          </AppCard>
        ))}

        {/* Dealer Segments */}
        <Text style={styles.section}>Dealer Segments</Text>
        <View style={styles.segrow}>
          {[
            { key: 'highValue', label: 'High Value', color: Colors.success },
            { key: 'atRisk', label: 'At Risk', color: Colors.warning },
            { key: 'dormant', label: 'Dormant', color: Colors.textMuted },
          ].map(({ key, label, color }) => (
            <AppCard key={key} style={[styles.segcol, { borderTopColor: color, borderTopWidth: 3 }]}>
              <Text style={[styles.segTitle, { color }]}>{label}</Text>
              {(segments[key] || []).map((name, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{name}</Text>
                </View>
              ))}
            </AppCard>
          ))}
        </View>

        {/* Pricing Suggestions */}
        <Text style={styles.section}>Pricing Suggestions</Text>
        {pricing.map((p, i) => (
          <AppCard key={i} style={styles.card}>
            <View style={styles.priceRow}>
              <Text style={styles.product}>{p.product}</Text>
              <View style={styles.prices}>
                <Text style={styles.curPrice}>₹{p.currentPrice}</Text>
                <Text style={styles.arrow}> → </Text>
                <Text style={styles.sugPrice}>₹{p.suggestedPrice}</Text>
              </View>
            </View>
            <Text style={styles.marginHint}>
              Margin: {p.currentMargin}% → {p.expectedMargin}%
              {' '}(+{(p.expectedMargin - p.currentMargin).toFixed(1)}%)
            </Text>
          </AppCard>
        ))}

        {/* Low Margin Alerts */}
        <Text style={styles.section}>Low Margin Alerts</Text>
        {margins.map((m, i) => (
          <View key={i} style={styles.alert}>
            <Text style={styles.alertProduct}>{m.product}</Text>
            <Text style={styles.alertMargin}>{m.marginPercent}% margin — Below {m.threshold}% threshold</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.text, marginBottom: Spacing.lg },
  section: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  card: { marginBottom: Spacing.sm },
  product: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  units: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.sm },
  barTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  confidence: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginTop: 4 },
  segrow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  segcol: { flex: 1, padding: Spacing.sm },
  segTitle: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold, marginBottom: Spacing.xs },
  chip: { backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: 4, marginTop: 3 },
  chipText: { fontSize: Typography.fontSize.xs, color: Colors.text },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prices: { flexDirection: 'row', alignItems: 'center' },
  curPrice: { fontSize: Typography.fontSize.md, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  arrow: { color: Colors.textMuted },
  sugPrice: { fontSize: Typography.fontSize.md, color: Colors.success, fontWeight: Typography.fontWeight.bold },
  marginHint: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  alert: {
    backgroundColor: Colors.dangerLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertProduct: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.danger },
  alertMargin: { fontSize: Typography.fontSize.sm, color: Colors.danger, marginTop: 2 },
});
