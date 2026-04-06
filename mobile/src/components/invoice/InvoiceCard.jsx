import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import AppBadge from '../common/AppBadge';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function InvoiceCard({ invoice, onPress }) {
  const statusVariant = {
    paid: 'success', partial: 'warning', unpaid: 'danger',
  }[invoice.paymentStatus] || 'muted';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
      <AppCard style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.id}>{invoice.invoiceId}</Text>
          <AppBadge label={invoice.paymentStatus} variant={statusVariant} />
        </View>
        <Text style={styles.dealer}>{invoice.dealerName}</Text>
        <Text style={styles.shop}>{invoice.dealerShop}</Text>
        <View style={styles.bottom}>
          <View>
            <Text style={styles.amount}>{formatINR(invoice.totalAmount)}</Text>
            {invoice.amountDue > 0 && (
              <Text style={styles.due}>Due: {formatINR(invoice.amountDue)}</Text>
            )}
          </View>
          <Text style={styles.date}>{formatDate(invoice.createdAt)}</Text>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.primary, fontFamily: 'monospace' },
  dealer: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.text, marginTop: Spacing.xs },
  shop: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: Spacing.md },
  amount: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  due: { fontSize: Typography.fontSize.sm, color: Colors.danger, fontWeight: Typography.fontWeight.semibold },
  date: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
});
