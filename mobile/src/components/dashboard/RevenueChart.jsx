import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryLegend, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import AppCard from '../common/AppCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';
import { formatMonthDay } from '../../utils/date';

const { width } = Dimensions.get('window');

export default function RevenueChart({ data = [] }) {
  if (!data.length) {
    return (
      <AppCard style={styles.card}>
        <Text style={styles.title}>Revenue vs Profit</Text>
        <Text style={styles.empty}>No data available</Text>
      </AppCard>
    );
  }

  const revenueData = data.map((d, i) => ({ x: i, y: d.revenue || 0, label: `${formatMonthDay(d._id)}\n${formatINR(d.revenue)}` }));
  const profitData = data.map((d, i) => ({ x: i, y: d.profit || 0, label: `${formatMonthDay(d._id)}\n${formatINR(d.profit)}` }));

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Revenue vs Profit (30 days)</Text>
      <VictoryChart
        width={width - 64}
        height={200}
        theme={VictoryTheme.material}
        padding={{ top: 16, bottom: 40, left: 60, right: 16 }}
        containerComponent={<VictoryVoronoiContainer />}
      >
        <VictoryAxis
          tickFormat={(t) => {
            const index = Math.round(t);
            const d = data[index];
            return d ? formatMonthDay(d._id) : '';
          }}
          tickCount={5}
          style={{ tickLabels: { fontSize: 8, fill: Colors.textMuted } }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `₹${(t / 1000).toFixed(0)}k`}
          style={{ tickLabels: { fontSize: 8, fill: Colors.textMuted } }}
        />
        <VictoryLine data={revenueData} style={{ data: { stroke: Colors.primary, strokeWidth: 2.5 } }} />
        <VictoryLine data={profitData} style={{ data: { stroke: Colors.success, strokeWidth: 2.5 } }} />
      </VictoryChart>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Revenue</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Profit</Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  title: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  empty: { color: Colors.textMuted, textAlign: 'center', padding: Spacing.xl },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
});
