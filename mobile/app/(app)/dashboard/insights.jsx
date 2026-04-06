import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useDashboardStore from '../../../src/store/useDashboardStore';
import AppLoader from '../../../src/components/common/AppLoader';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PERIODS = ['DAY', 'WEEK', 'MONTH', 'YEAR'];

export default function InsightsScreen() {
  const { mlInsights, fetchMlInsights, isLoading } = useDashboardStore();
  const [period, setPeriod] = useState('MONTH');

  useEffect(() => { fetchMlInsights(); }, []);

  if (isLoading && !mlInsights) return <AppLoader fullScreen label="Processing Carbon Analytics..." />;

  const { demand = [], segments = {}, pricing = [], margins = [] } = mlInsights || {};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CARBON ANALYTICS</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Industrial Segmented Control */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity 
              key={p} 
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sales Area Chart Highlight */}
        <Text style={styles.sectionHeading}>REVENUE TREND</Text>
        <AppCard style={styles.chartCard} shadow="md">
          <View style={styles.chartTitleRow}>
             <View>
                <Text style={styles.totalValue}>₹2.45L</Text>
                <Text style={styles.totalLabel}>PERIOD REVENUE</Text>
             </View>
             <View style={styles.trendIndicator}>
               <Feather name="trending-up" size={14} color={Colors.primary} />
               <Text style={styles.trendText}>+8.4%</Text>
             </View>
          </View>
          {/* Visual Placeholder for Modern Line Chart */}
          <View style={styles.chartVisual}>
            <View style={styles.chartGrid} />
            <View style={styles.chartLine} />
            <View style={styles.chartFill} />
          </View>
        </AppCard>

        {/* High-Performance Products */}
        <Text style={styles.sectionHeading}>PERFORMANCE BY SKU</Text>
        <View style={styles.topGrid}>
          {demand.slice(0, 4).map((p, i) => (
            <AppCard key={i} style={styles.productCell} shadow="sm">
               <View style={styles.skuIcon}>
                  <Feather name="package" size={20} color={Colors.white} />
               </View>
               <Text style={styles.skuName} numberOfLines={1}>{p.product}</Text>
               <Text style={styles.skuProfit}>{formatINR(p.expectedUnits * 500)}</Text>
               <View style={styles.meter}>
                 <View style={[styles.meterFill, { width: `${85 - i * 15}%` }]} />
               </View>
               <Text style={styles.meterLabel}>{85 - i * 15}% SHARE</Text>
            </AppCard>
          ))}
        </View>

        {/* Customer Density */}
        <Text style={styles.sectionHeading}>CUSTOMER DENSITY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.densityScroll}>
           {Object.keys(segments).map((key, i) => (
             <AppCard key={key} style={styles.densityCard} shadow="sm">
                <View style={[styles.densityDot, { backgroundColor: i === 0 ? Colors.primary : Colors.white }]} />
                <Text style={styles.densityName}>{key.toUpperCase()}</Text>
                <Text style={styles.densityStat}>{segments[key].length} ACCOUNTS</Text>
             </AppCard>
           ))}
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.black },
  header: { 
    padding: Spacing.md, 
    backgroundColor: Colors.black, 
    borderBottomWidth: 1.5, 
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Colors.white, letterSpacing: 2 },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  periodRow: { 
    flexDirection: 'row', 
    backgroundColor: Colors.surface, 
    borderRadius: 8, 
    padding: 6, 
    marginVertical: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 4 },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 11, color: Colors.textMuted, fontWeight: '800', letterSpacing: 1 },
  periodTextActive: { color: Colors.black, fontWeight: '900' },
  sectionHeading: { fontSize: 12, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 2, marginBottom: 16 },
  chartCard: { padding: 24, marginBottom: 24, backgroundColor: Colors.surface },
  chartTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  totalValue: { fontSize: 28, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  totalLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5 },
  trendIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 107, 0, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Colors.primary },
  trendText: { color: Colors.primary, fontSize: 11, fontWeight: '900', marginLeft: 4 },
  chartVisual: { height: 140, justifyContent: 'flex-end', paddingTop: 20 },
  chartGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 0, borderRightWidth: 0, opacity: 0.2 },
  chartLine: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  chartFill: { height: 80, backgroundColor: 'rgba(255, 107, 0, 0.05)', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  topGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  productCell: { width: (SCREEN_WIDTH - 32 - 16) / 2, padding: 16, backgroundColor: Colors.black, borderWidth: 1.5, borderColor: Colors.border },
  skuIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  skuName: { fontSize: 14, fontWeight: '800', color: Colors.white, marginBottom: 2 },
  skuProfit: { fontSize: 13, color: Colors.primary, fontWeight: '900' },
  meter: { height: 3, backgroundColor: Colors.border, borderRadius: 2, marginTop: 16, overflow: 'hidden' },
  meterFill: { height: '100%', backgroundColor: Colors.primary },
  meterLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 6, fontWeight: '800', letterSpacing: 0.5 },
  densityScroll: { marginHorizontal: -Spacing.base, paddingHorizontal: Spacing.base },
  densityCard: { width: 160, marginRight: 16, padding: 20, backgroundColor: Colors.surface },
  densityDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 12 },
  densityName: { fontSize: 11, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  densityStat: { fontSize: 9, color: Colors.textSecondary, marginTop: 4, fontWeight: '700' },
});
