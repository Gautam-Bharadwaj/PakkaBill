import React, { useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl, StatusBar, TouchableOpacity, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Layers, Users, Settings, ArrowUpRight, TrendingUp, Clock } from 'lucide-react-native';
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

        <View style={styles.heroRow}>
           <AppCard style={[styles.heroCard, { flex: 1, borderColor: Colors.primary }]}>
             <View style={styles.heroHeader}>
                <Text style={styles.heroLabel}>MONTHLY SALES</Text>
                <TrendingUp size={14} color={Colors.primary} strokeWidth={2.5} />
             </View>
             <Text style={styles.heroValue}>{formatINR(monthlyRevenue)}</Text>
             <View style={styles.trendRow}>
                <ArrowUpRight size={10} color={Colors.success || '#4ADE80'} strokeWidth={3} />
                <Text style={styles.trendText}>+12% VS LAST MONTH</Text>
             </View>
           </AppCard>

           <AppCard style={[styles.heroCard, { flex: 1, borderColor: Colors.border }]}>
             <View style={styles.heroHeader}>
                <Text style={styles.heroLabel}>TOTAL DUES</Text>
                <Clock size={14} color={Colors.error || '#FF3333'} strokeWidth={2.5} />
             </View>
             <Text style={[styles.heroValue, { color: Colors.white }]}>{formatINR(summary?.totalPendingAmount || 0)}</Text>
             <TouchableOpacity style={styles.dueAction} onPress={() => router.push({ pathname: '/invoices', params: { status: 'unpaid' } })}>
                <Text style={styles.dueActionText}>VIEW CUSTOMERS</Text>
             </TouchableOpacity>
           </AppCard>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/invoices')}
          >
            <AppCard style={styles.actionCard}>
               <View style={styles.iconCircle}>
                 <Layers size={24} color={Colors.primary} strokeWidth={2.5} />
               </View>
               <Text style={styles.actionTitle}>ALL BILLS</Text>
            </AppCard>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/dealers')}
          >
            <AppCard style={styles.actionCard}>
               <View style={styles.iconCircle}>
                 <Users size={24} color={Colors.primary} strokeWidth={2.5} />
               </View>
               <Text style={styles.actionTitle}>CUSTOMERS</Text>
            </AppCard>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>LATEST TRANSACTIONS</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/invoices')}>
             <Text style={styles.viewMore}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.listContainer}>
          {(recentInvoices?.length || 0) === 0 ? (
             <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>NO SALES RECORDED TODAY</Text>
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
        
        <View style={{ height: 140 }} />
      </ScrollView>

      <AiChatWidget />
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
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  trendText: { color: Colors.success || '#4ADE80', fontSize: 9, fontWeight: '700' },
  dueAction: { marginTop: 12 },
  dueActionText: { color: Colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  quickActions: { flexDirection: 'row', gap: 16, marginBottom: 36 },
  actionItem: { flex: 1 },
  actionCard: { 
    backgroundColor: Colors.surface, 
    alignItems: 'center', 
    paddingVertical: 24, 
    borderRadius: 22, 
    borderWidth: 1.5, 
    borderColor: Colors.border,
  },
  iconCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: Colors.black, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionTitle: { fontSize: 10, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1 },
  viewMore: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  listContainer: { paddingBottom: 100 },
  emptyWrap: { padding: 40, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1.5, borderColor: Colors.border },
  emptyText: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  settingsBtn: { padding: 10, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
});
