import React, { useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl, SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useDashboardStore from '../../../src/store/useDashboardStore';
import AppHeader from '../../../src/components/common/AppHeader';
import AppCard from '../../../src/components/common/AppCard';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';
import { getGreeting, formatDate } from '../../../src/utils/date';

export default function DashboardScreen() {
  const { summary, revenueChart, topProducts, pendingDealers, isLoading, error, fetchAll } = useDashboardStore();

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = useCallback(() => { fetchAll(); }, []);

  if (isLoading && !summary) return <AppLoader fullScreen label="Checking System Health..." />;
  if (error && !summary) return <AppError message={error} onRetry={fetchAll} />;

  const todayRevenue = summary?.totalRevenueMTD || 0; 

  const RightAction = (
    <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8}>
       <View style={styles.avatarWrap}>
          <Feather name="settings" size={18} color={Colors.white} />
       </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      {/* Normalized Top Navbar */}
      <AppHeader 
        logo={true} 
        rightAction={RightAction} 
        subtitle={formatDate(new Date(), 'EEEE, dd MMM')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greetingText}>{getGreeting()}, RAHUL 👋</Text>

        {/* Carbon Dark Revenue Card */}
        <AppCard style={styles.heroCard} shadow="lg">
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>TODAY'S EARNINGS</Text>
            <View style={styles.trendPill}>
              <Text style={styles.trendText}>↑ 12%</Text>
            </View>
          </View>
          <Text style={styles.heroValue}>₹{Number(todayRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroFooter}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>MTD SALES</Text>
              <Text style={styles.heroStatValue}>₹{Number(todayRevenue * 1.5).toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity style={styles.heroAction}>
               <Feather name="chevron-right" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/invoices')}
          >
            <AppCard style={styles.actionCard} shadow="sm">
               <View style={styles.iconCircle}>
                 <Feather name="file-text" size={24} color={Colors.white} />
               </View>
               <Text style={styles.actionTitle}>RECENT BILLS</Text>
            </AppCard>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/dealers')}
          >
            <AppCard style={styles.actionCard} shadow="sm">
               <View style={styles.iconCircle}>
                 <Feather name="users" size={24} color={Colors.white} />
               </View>
               <Text style={styles.actionTitle}>ACCOUNTS</Text>
            </AppCard>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/invoices')}>
             <Text style={styles.viewMore}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.listContainer}>
          {(pendingDealers || []).slice(0, 5).map((d, i) => (
            <AppCard key={i} style={styles.listItem} shadow="sm" padded={false}>
              <TouchableOpacity style={styles.listInner} onPress={() => router.push(`/(app)/dealers/${d._id}`)}>
                <View style={styles.listInfo}>
                  <Text style={styles.listCustomer}>{d.name}</Text>
                  <Text style={styles.listMeta}>TRANSFERRED • {formatDate(new Date(), 'hh:mm a')}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.listAmount}>{formatINR(d.balance)}</Text>
                  <View style={[styles.statusBadge, { borderColor: i % 2 === 0 ? Colors.primary : Colors.border }]}>
                    <Text style={[styles.statusText, { color: i % 2 === 0 ? Colors.primary : Colors.textMuted }]}>
                      {i % 2 === 0 ? 'PAID' : 'PENDING'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </AppCard>
          ))}
        </View>
        
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: 100 },
  greetingText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 20,
    marginTop: 8,
  },
  profileBtn: {
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: Colors.black,
    padding: 24,
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  trendPill: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  trendText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  heroValue: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
    opacity: 0.5,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroStatLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 1.5,
  },
  heroStatValue: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  heroAction: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 24,
  },
  actionItem: {
    flex: 1,
  },
  actionCard: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  viewMore: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  listInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  listCustomer: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
  listMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
});
