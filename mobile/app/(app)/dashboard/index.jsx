import React, { useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl, StatusBar, TouchableOpacity, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Layers, Users, Settings, ArrowUpRight, ArrowDownRight, TrendingUp, Clock } from 'lucide-react-native';
import useDashboardStore from '../../../src/store/useDashboardStore';
import useAuthStore from '../../../src/store/useAuthStore';
import AppHeader from '../../../src/components/common/AppHeader';
import AppCard from '../../../src/components/common/AppCard';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import InvoiceCard from '../../../src/components/invoice/InvoiceCard';
import AiInsightCard from '../../../src/components/dashboard/AiInsightCard';
import AiChatWidget from '../../../src/components/ai/AiChatWidget';
import { Colors } from '../../../src/theme/colors';
import { formatINR } from '../../../src/utils/currency';
import { formatDate } from '../../../src/utils/date';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const { summary, recentInvoices, isLoading, error, fetchAll } = useDashboardStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = useCallback(() => { fetchAll(); }, []);

  if (isLoading && !summary) return <AppLoader fullScreen label="SYNCING BUSINESS DATA..." />;
  if (error && !summary) return <AppError message={error} onRetry={fetchAll} />;

  const monthlyRevenue = summary?.totalRevenueMTD || 0; 
  const userName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'ADMIN';

  const RightAction = (
    <TouchableOpacity 
      style={styles.settingsBtn} 
      activeOpacity={0.8}
      onPress={() => router.push('/(app)/settings')}
    >
       <Settings size={20} color={Colors.white} strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      <AppHeader 
        logo={true} 
        rightAction={RightAction} 
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
           <Text style={styles.greetingText}>HELLO, {userName}</Text>
           <Text style={styles.subGreeting}>{formatDate(new Date(), 'EEEE, dd MMMM').toUpperCase()}</Text>
        </View>

        <AiInsightCard />

        <View style={styles.quickActionsGrid}>
           <TouchableOpacity 
             style={[styles.primaryAction, { backgroundColor: Colors.primary }]}
             activeOpacity={0.8}
             onPress={() => router.push('/(app)/invoices/new')}
           >
              <View style={styles.actionHeader}>
                <Layers size={22} color={Colors.black} strokeWidth={2.5} />
                <Text style={styles.actionTag}>FAST</Text>
              </View>
              <Text style={styles.primaryActionTitle}>CREATE NEW BILL</Text>
           </TouchableOpacity>

           <TouchableOpacity 
             style={[styles.primaryAction, { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border }]}
             activeOpacity={0.8}
             onPress={() => router.push('/(app)/dealers')}
           >
              <View style={styles.actionHeader}>
                <Users size={22} color={Colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.primaryActionTitle, { color: Colors.white }]}>MY CUSTOMERS</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.heroRow}>
           <AppCard style={[styles.heroCard, { flex: 1, borderColor: Colors.primary }]}>
             <View style={styles.heroHeader}>
                <Text style={styles.heroLabel}>MONTHLY SALES</Text>
                <TrendingUp size={14} color={Colors.primary} strokeWidth={2.5} />
             </View>
             <Text style={styles.heroValue}>{formatINR(monthlyRevenue)}</Text>
             <View style={styles.trendRow}>
                {summary?.revenueGrowth >= 0 ? (
                  <ArrowUpRight size={10} color={Colors.success} strokeWidth={3} />
                ) : (
                  <ArrowDownRight size={10} color={Colors.error} strokeWidth={3} />
                )}
                <Text style={[styles.trendText, { color: summary?.revenueGrowth >= 0 ? Colors.success : Colors.error }]}>
                  {summary?.revenueGrowth > 0 ? '+' : ''}{summary?.revenueGrowth || 0}% VS LAST MONTH
                </Text>
             </View>
           </AppCard>

           <AppCard style={[styles.heroCard, { flex: 1, borderColor: Colors.border }]}>
             <View style={styles.heroHeader}>
                <Text style={styles.heroLabel}>PENDING DUES</Text>
                <Clock size={14} color={Colors.error || '#FF3333'} strokeWidth={2.5} />
             </View>
             <Text style={[styles.heroValue, { color: Colors.white }]}>{formatINR(summary?.totalPendingAmount || 0)}</Text>
             <TouchableOpacity style={styles.dueAction} onPress={() => router.push({ pathname: '/invoices', params: { status: 'unpaid' } })}>
                <Text style={styles.dueActionText}>COLLECT NOW</Text>
             </TouchableOpacity>
           </AppCard>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>RECENT BILLS</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/invoices')}>
             <Text style={styles.viewMore}>VIEW ALL HISTORY</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.listContainer}>
          {(recentInvoices?.length || 0) === 0 ? (
             <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>NO SALES RECORDED YET</Text>
             </View>
          ) : (
            recentInvoices?.map((inv) => (
              <InvoiceCard 
                key={inv._id} 
                invoice={inv} 
                onPress={() => router.push(`/(app)/invoices/${inv._id}`)} 
              />
            ))
          )}
        </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  scroll: { flex: 1 },
  content: { padding: 20 },
  welcomeSection: { marginBottom: 28 },
  greetingText: { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  subGreeting: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, marginTop: 4, letterSpacing: 1.5 },
  heroRow: { flexDirection: 'row', gap: 14, marginBottom: 28 },
  heroCard: { 
    backgroundColor: Colors.surface, 
    padding: 18, 
    borderRadius: 22, 
    borderWidth: 1.5, 
    borderColor: Colors.border,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroLabel: { color: Colors.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  heroValue: { color: Colors.white, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  heroValue: { color: Colors.white, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  trendText: { fontSize: 9, fontWeight: '700' },
  dueAction: { marginTop: 12 },
  dueActionText: { color: Colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  quickActionsGrid: { flexDirection: 'row', gap: 16, marginBottom: 28 },
  primaryAction: { 
    flex: 1, 
    padding: 20, 
    borderRadius: 24, 
    justifyContent: 'space-between',
    minHeight: 110,
  },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionTag: { fontSize: 8, fontWeight: '900', color: Colors.black, backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  primaryActionTitle: { fontSize: 13, fontWeight: '900', color: Colors.black, marginTop: 10, letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1 },
  viewMore: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  listContainer: { paddingBottom: 100 },
  emptyWrap: { padding: 40, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1.5, borderColor: Colors.border },
  emptyText: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  settingsBtn: { padding: 10, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
});
