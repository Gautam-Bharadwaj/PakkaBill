import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import InvoiceCard from '../../../../src/components/invoice/InvoiceCard';
import AppLoader from '../../../../src/components/common/AppLoader';
import AppEmpty from '../../../../src/components/common/AppEmpty';
import { Colors } from '../../../../src/theme/colors';
import { Typography } from '../../../../src/theme/typography';
import { Spacing } from '../../../../src/theme/spacing';
import { getDealerInvoices, getDealerPayments } from '../../../../src/api/dealer.api';
import { formatINR } from '../../../../src/utils/currency';
import { formatDate } from '../../../../src/utils/date';

export default function DealerHistoryScreen() {
  const { id } = useLocalSearchParams();
  const [tab, setTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [invRes, payRes] = await Promise.allSettled([
        getDealerInvoices(id),
        getDealerPayments(id),
      ]);
      if (invRes.status === 'fulfilled') setInvoices(invRes.value.data.data || []);
      if (payRes.status === 'fulfilled') setPayments(payRes.value.data.data || []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <AppLoader fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>History</Text>
      </View>
      <View style={styles.tabs}>
        {['invoices', 'payments'].map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'invoices' ? (
          invoices.length === 0 ? <AppEmpty title="No invoices" /> :
          invoices.map((inv) => (
            <InvoiceCard key={inv._id} invoice={inv} onPress={() => router.push(`/(app)/invoices/${inv._id}`)} />
          ))
        ) : (
          payments.length === 0 ? <AppEmpty title="No payments" /> :
          payments.map((p) => (
            <View key={p._id} style={styles.payRow}>
              <Text style={styles.payAmount}>{formatINR(p.amount)}</Text>
              <View>
                <Text style={styles.payMode}>{p.mode.toUpperCase()}</Text>
                <Text style={styles.payDate}>{formatDate(p.createdAt, 'dd MMM yyyy, hh:mm a')}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.md },
  back: { color: Colors.primary, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.md },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontWeight: Typography.fontWeight.medium },
  tabTextActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
  content: { padding: Spacing.base },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.white, borderRadius: 8, marginBottom: Spacing.sm },
  payAmount: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.success },
  payMode: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  payDate: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
});
