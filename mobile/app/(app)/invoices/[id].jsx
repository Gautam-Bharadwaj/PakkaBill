import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import InvoiceSummary from '../../../src/components/invoice/InvoiceSummary';
import PaymentStatusBadge from '../../../src/components/invoice/PaymentStatusBadge';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import AppButton from '../../../src/components/common/AppButton';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';
import { formatDate } from '../../../src/utils/date';
import { sendInvoiceWhatsApp, getInvoicePdfUrl } from '../../../src/api/invoice.api';
import { getPaymentsByInvoice } from '../../../src/api/payment.api';
import { openWhatsApp, buildInvoiceMessage } from '../../../src/utils/whatsapp';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currentInvoice: invoice, isLoading, error, fetchInvoice } = useInvoiceStore();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchInvoice(id);
    getPaymentsByInvoice(id).then(({ data }) => setPayments(data.data || [])).catch(() => {});
  }, [id]);

  if (isLoading || !invoice) return <AppLoader fullScreen />;
  if (error) return <AppError message={error} onRetry={() => fetchInvoice(id)} />;

  const handleWhatsApp = () => openWhatsApp(invoice.dealerPhone, buildInvoiceMessage(invoice));
  const handlePDF = () => Linking.openURL(`${getInvoicePdfUrl(id)}`);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.id}>{invoice.invoiceId}</Text>
            <Text style={styles.date}>{formatDate(invoice.createdAt)}</Text>
          </View>
          <PaymentStatusBadge status={invoice.paymentStatus} />
        </View>

        {/* Dealer */}
        <AppCard style={styles.dealerCard}>
          <Text style={styles.dealerName}>{invoice.dealerName}</Text>
          <Text style={styles.dealerShop}>{invoice.dealerShop}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${invoice.dealerPhone}`)}>
            <Text style={styles.dealerPhone}>Ph: {invoice.dealerPhone}</Text>
          </TouchableOpacity>
        </AppCard>

        {/* Line items */}
        <Text style={styles.sectionTitle}>Items</Text>
        {invoice.lineItems?.map((item, i) => (
          <View key={i} style={styles.lineRow}>
            <Text style={styles.lineName}>{item.productName}</Text>
            <Text style={styles.lineQty}>×{item.quantity}</Text>
            <Text style={styles.lineTotal}>{formatINR(item.lineTotal)}</Text>
          </View>
        ))}

        {/* Summary */}
        <InvoiceSummary
          subtotal={invoice.subtotal}
          discountTotal={invoice.discountTotal}
          gstRate={invoice.gstRate}
          gstAmount={invoice.gstAmount}
          totalAmount={invoice.totalAmount}
          totalProfit={invoice.totalProfit}
          amountPaid={invoice.amountPaid}
          amountDue={invoice.amountDue}
        />

        {/* Actions */}
        <View style={styles.actionsGrid}>
          <AppButton title="Download PDF" onPress={handlePDF} variant="secondary" style={styles.actionBtn} />
          <AppButton title="WhatsApp" onPress={handleWhatsApp} variant="success" style={styles.actionBtn} />
          {invoice.amountDue > 0 && (
            <AppButton title="Record Payment" onPress={() => router.push(`/(app)/payments/${id}`)} style={styles.actionBtn} />
          )}
          <AppButton title="Generate QR" onPress={() => router.push(`/(app)/payments/qr/${id}`)} variant="secondary" style={styles.actionBtn} />
        </View>

        {/* Payment history */}
        {payments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {payments.map((p) => (
              <View key={p._id} style={styles.payRow}>
                <View>
                  <Text style={styles.payMode}>{p.mode.toUpperCase()}</Text>
                  <Text style={styles.payDate}>{formatDate(p.createdAt, 'dd MMM yyyy, hh:mm a')}</Text>
                </View>
                <Text style={styles.payAmount}>{formatINR(p.amount)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  back: { color: Colors.primary, fontWeight: Typography.fontWeight.semibold, marginBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  id: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text, fontFamily: 'monospace' },
  date: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  dealerCard: { marginBottom: Spacing.md },
  dealerName: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  dealerShop: { fontSize: Typography.fontSize.md, color: Colors.textSecondary },
  dealerPhone: { fontSize: Typography.fontSize.md, color: Colors.primary, marginTop: 4 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  lineName: { flex: 1, fontSize: Typography.fontSize.md, color: Colors.text },
  lineQty: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, marginHorizontal: Spacing.sm },
  lineTotal: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginVertical: Spacing.md },
  actionBtn: { flex: 1, minWidth: '45%' },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.white, borderRadius: 8, marginBottom: Spacing.xs },
  payMode: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  payDate: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  payAmount: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.success },
});
