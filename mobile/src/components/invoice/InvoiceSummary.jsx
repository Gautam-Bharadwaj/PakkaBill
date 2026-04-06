import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';

const Row = ({ label, value, bold, color }) => (
  <View style={styles.row}>
    <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.value, bold && styles.bold, color && { color }]}>{value}</Text>
  </View>
);

export default function InvoiceSummary({ subtotal, discountTotal, gstRate, gstAmount, totalAmount, totalProfit, amountPaid, amountDue }) {
  return (
    <AppCard style={styles.card}>
      <Row label="Subtotal" value={formatINR(subtotal)} />
      {discountTotal > 0 && <Row label="Discount" value={`−${formatINR(discountTotal)}`} />}
      {gstRate > 0 && <Row label={`GST (${gstRate}%)`} value={formatINR(gstAmount)} />}
      <View style={styles.divider} />
      <Row label="Grand Total" value={formatINR(totalAmount)} bold />
      <Row label="Profit" value={formatINR(totalProfit)} color={Colors.success} />
      <View style={styles.divider} />
      <Row label="Amount Paid" value={formatINR(amountPaid)} color={Colors.success} />
      {amountDue > 0 && <Row label="Amount Due" value={formatINR(amountDue)} bold color={Colors.danger} />}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: Typography.fontSize.md, color: Colors.textSecondary },
  value: { fontSize: Typography.fontSize.md, color: Colors.text, fontWeight: Typography.fontWeight.medium },
  bold: { fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.base },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.sm },
});
