import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { TrendingUp, Package, Users, Zap, ArrowUpRight, BarChart3, Target } from 'lucide-react-native';
import useDashboardStore from '../../../src/store/useDashboardStore';
import AppLoader from '../../../src/components/common/AppLoader';
import AppCard from '../../../src/components/common/AppCard';
import AppHeader from '../../../src/components/common/AppHeader';
import { Colors } from '../../../src/theme/colors';
import { formatINR } from '../../../src/utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PERIODS = ['DAY', 'WEEK', 'MONTH', 'YEAR'];

export default function InsightsScreen() {
  const { mlInsights, fetchMlInsights, isLoading } = useDashboardStore();
  const [period, setPeriod] = useState('MONTH');

  useEffect(() => { fetchMlInsights(); }, []);

  if (isLoading && !mlInsights) return <AppLoader fullScreen label="ENGINEERING SMART INSIGHTS..." />;

  const { demand = [], segments = {}, pricing = [], margins = [] } = mlInsights || {};

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="CARBON ANALYTICS" showBack />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Modern Segmented Control */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity 
              key={p} 
              activeOpacity={0.8}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sales Area Chart Highlight */}
        <View style={styles.sectionHeader}>
            <BarChart3 size={16} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>REVENUE PREDICTION</Text>
        </View>
        
        <AppCard style={styles.chartCard}>
          <View style={styles.chartTitleRow}>
             <View>
                <Text style={styles.totalValue}>₹2.45L</Text>
                <Text style={styles.totalLabel}>EXPECTED REVENUE</Text>
             </View>
             <View style={styles.trendIndicator}>
               <TrendingUp size={14} color={Colors.success || '#4ADE80'} strokeWidth={2.5} />
               <Text style={styles.trendText}>+8.4%</Text>
             </View>
          </View>
          
          <View style={styles.chartVisual}>
             <View style={styles.chartBarGroup}>
                {[40, 65, 45, 90, 55, 75, 60].map((h, i) => (
                    <View key={i} style={[styles.chartBar, { height: h, opacity: i === 3 ? 1 : 0.3 }]} />
                ))}
             </View>
             <View style={styles.chartBaseLine} />
          </View>
        </AppCard>

        {/* Machine Learning Demand Logic */}
        <View style={styles.sectionHeader}>
            <Zap size={16} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>DEMAND FORECASTING (ML)</Text>
        </View>
        
        <View style={styles.topGrid}>
          {demand.slice(0, 4).map((p, i) => (
            <AppCard key={i} style={styles.productCell} shadow="sm">
               <View style={styles.skuIcon}>
                  <Package size={20} color={Colors.primary} strokeWidth={2} />
               </View>
               <Text style={styles.skuName} numberOfLines={1}>{p.product.toUpperCase()}</Text>
               <Text style={styles.skuProfit}>{formatINR(p.expectedUnits * 500)}</Text>
               <View style={styles.meter}>
                  <View style={[styles.meterFill, { width: `${85 - i * 15}%` }]} />
               </View>
               <View style={styles.meterRow}>
                  <Text style={styles.meterLabel}>{85 - i * 15}% CONFIDENCE</Text>
                  <ArrowUpRight size={10} color={Colors.success || '#4ADE80'} />
               </View>
            </AppCard>
          ))}
        </View>

        {/* Customer Segmentation */}
        <View style={styles.sectionHeader}>
            <Users size={16} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>CUSTOMER SEGMENTS</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.densityScroll} contentContainerStyle={{ paddingRight: 40 }}>
           {Object.keys(segments).map((key, i) => (
             <AppCard key={key} style={styles.densityCard}>
                <View style={[styles.densityDot, { backgroundColor: i === 0 ? Colors.primary : Colors.white }]} />
                <Text style={styles.densityName}>{key.toUpperCase()}</Text>
                <Text style={styles.densityStat}>{segments[key].length} ACCOUNTS</Text>
                <TouchableOpacity style={styles.segmentAction}>
                    <Target size={12} color={Colors.primary} />
                    <Text style={styles.segmentActionText}>TARGET</Text>
                </TouchableOpacity>
             </AppCard>
           ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1 },
  content: { padding: 24 },
  periodRow: { 
    flexDirection: 'row', 
    backgroundColor: Colors.surface, 
    borderRadius: 16, 
    padding: 6, 
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  periodBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodText: { fontSize: 10, color: Colors.textMuted, fontWeight: '900', letterSpacing: 1.5 },
  periodTextActive: { color: Colors.black },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 8 },
  sectionHeading: { fontSize: 11, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1.5 },
  chartCard: { padding: 24, marginBottom: 32, backgroundColor: Colors.surface, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.border },
  chartTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  totalValue: { fontSize: 32, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  totalLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, marginTop: 4 },
  trendIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.2)' },
  trendText: { color: Colors.success || '#46D076', fontSize: 12, fontWeight: '900', marginLeft: 4 },
  chartVisual: { height: 100, justifyContent: 'flex-end' },
  chartBarGroup: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10, height: '100%' },
  chartBar: { width: 12, backgroundColor: Colors.primary, borderRadius: 6 },
  chartBaseLine: { height: 2, backgroundColor: Colors.border, marginTop: 10, borderRadius: 1 },
  topGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  productCell: { width: (SCREEN_WIDTH - 48 - 16) / 2, padding: 20, backgroundColor: Colors.surface, borderRadius: 24 },
  skuIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  skuName: { fontSize: 12, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  skuProfit: { fontSize: 15, color: Colors.white, fontWeight: '900' },
  meter: { height: 4, backgroundColor: Colors.black, borderRadius: 2, marginTop: 16, overflow: 'hidden' },
  meterFill: { height: '100%', backgroundColor: Colors.primary },
  meterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  meterLabel: { fontSize: 8, color: Colors.textMuted, fontWeight: '800', letterSpacing: 0.5 },
  densityScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
  densityCard: { width: 160, marginRight: 16, padding: 24, backgroundColor: Colors.surface, borderRadius: 24 },
  densityDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 16 },
  densityName: { fontSize: 12, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  densityStat: { fontSize: 10, color: Colors.textSecondary, marginTop: 6, fontWeight: '800' },
  segmentAction: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: Colors.black, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  segmentActionText: { color: Colors.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
});
