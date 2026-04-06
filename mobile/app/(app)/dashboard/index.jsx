import React, { useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl, SafeAreaView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import useDashboardStore from '../../../src/store/useDashboardStore';
import SummaryCard from '../../../src/components/dashboard/SummaryCard';
import RevenueChart from '../../../src/components/dashboard/RevenueChart';
import TopProductsList from '../../../src/components/dashboard/TopProductsList';
import PendingDealersList from '../../../src/components/dashboard/PendingDealersList';
import InvoiceCard from '../../../src/components/invoice/InvoiceCard';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';
import { getGreeting, formatDate } from '../../../src/utils/date';

export default function DashboardScreen() {
  const { summary, revenueChart, topProducts, pendingDealers, isLoading, error, fetchAll } = useDashboardStore();

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = useCallback(() => { fetchAll(); }, []);

  if (isLoading && !summary) return <AppLoader fullScreen label="Loading dashboard..." />;
  if (error && !summary) return <AppError message={error} onRetry={fetchAll} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>{formatDate(new Date(), 'EEEE, dd MMM yyyy')}</Text>
          </View>
          <View style={styles.bellContainer} />
        </View>

        {/* Summary Cards 2×2 */}
        <View style={styles.statsGrid}>
          <SummaryCard
            title="Revenue MTD"
            value={formatINR(summary?.totalRevenueMTD || 0)}
            icon="revenue"
            color={Colors.primary}
          />
          <SummaryCard
            title="Profit MTD"
            value={formatINR(summary?.totalProfitMTD || 0)}
            icon="profit"
            color={Colors.success}
          />
          <SummaryCard
            title="Pending"
            value={formatINR(summary?.totalPendingAmount || 0)}
            icon="pending"
            color={Colors.danger}
          />
          <SummaryCard
            title="Active Dealers"
            value={String(summary?.activeDealers || 0)}
            icon="dealers"
            color={Colors.primary}
          />
        </View>

        {/* Revenue Chart */}
        <RevenueChart data={revenueChart} />

        {/* Top Products */}
        <TopProductsList products={topProducts} />

        {/* Pending Dealers */}
        <PendingDealersList dealers={pendingDealers} />

        {/* View All Invoices */}
        <View style={styles.viewAll}>
          <Text style={styles.viewAllText} onPress={() => router.push('/(app)/invoices')}>
            View All Invoices →
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  greeting: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.text },
  date: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  bell: { fontSize: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs, marginBottom: Spacing.md },
  viewAll: { alignItems: 'center', marginTop: Spacing.md },
  viewAllText: { color: Colors.primary, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.md },
});
