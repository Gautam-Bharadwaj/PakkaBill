import React, { useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useDealerStore from '../../../src/store/useDealerStore';
import CreditBar from '../../../src/components/dealer/CreditBar';
import InvoiceCard from '../../../src/components/invoice/InvoiceCard';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import AppButton from '../../../src/components/common/AppButton';
import AppEmpty from '../../../src/components/common/AppEmpty';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';
import { openWhatsApp, buildReminderMessage } from '../../../src/utils/whatsapp';
import { getDealerInvoices } from '../../../src/api/dealer.api';

export default function DealerProfileScreen() {
  const { id } = useLocalSearchParams();
  const { currentDealer: dealer, isLoading, error, fetchDealer } = useDealerStore();
  const [invoices, setInvoices] = React.useState([]);

  useEffect(() => {
    fetchDealer(id);
    getDealerInvoices(id, { limit: 10 }).then(({ data }) => setInvoices(data.data || [])).catch(() => {});
  }, [id]);

  if (isLoading) return <AppLoader fullScreen />;
  if (error || !dealer) return <AppError message={error || 'Dealer not found'} onRetry={() => fetchDealer(id)} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back + Edit */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/(app)/dealers/${id}/edit`)}><Text style={styles.edit}>Edit</Text></TouchableOpacity>
        </View>

        {/* Header */}
        <Text style={styles.name}>{dealer.name}</Text>
        <Text style={styles.shop}>{dealer.shopName}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${dealer.phone}`)}>
          <Text style={styles.phone}>Ph: {dealer.phone}</Text>
        </TouchableOpacity>

        {/* Credit Bar */}
        <CreditBar used={dealer.pendingAmount} limit={dealer.creditLimit} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Purchased', value: formatINR(dealer.totalPurchased || 0) },
            { label: 'Invoices', value: dealer.invoiceCount || 0 },
            { label: 'Pending', value: formatINR(dealer.pendingAmount || 0) },
          ].map(({ label, value }) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AppButton
            title="New Invoice"
            onPress={() => router.push(`/(app)/invoices/new?dealerId=${id}`)}
            style={styles.actionBtn}
          />
          <AppButton
            title="Remind"
            variant="success"
            onPress={() => openWhatsApp(dealer.phone, buildReminderMessage(dealer, dealer.pendingAmount))}
            style={styles.actionBtn}
          />
          <AppButton
            title="Call"
            variant="secondary"
            onPress={() => Linking.openURL(`tel:${dealer.phone}`)}
            style={styles.actionBtn}
          />
        </View>

        {/* Recent Invoices */}
        <Text style={styles.sectionTitle}>Recent Invoices</Text>
        {invoices.length === 0 ? (
          <AppEmpty title="No invoices yet" />
        ) : (
          invoices.map((inv) => (
            <InvoiceCard key={inv._id} invoice={inv} onPress={() => router.push(`/(app)/invoices/${inv._id}`)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  back: { color: Colors.primary, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold },
  edit: { color: Colors.primary, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold },
  name: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.text },
  shop: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, marginTop: 2 },
  phone: { fontSize: Typography.fontSize.md, color: Colors.primary, fontWeight: Typography.fontWeight.medium, marginTop: Spacing.sm, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  actionBtn: { flex: 1 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
});
