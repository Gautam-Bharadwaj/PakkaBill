import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import AppCard from '../common/AppCard';
import AppBadge from '../common/AppBadge';
import CreditBar from './CreditBar';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';
import { CREDIT_THRESHOLDS } from '../../constants/app';

export default function DealerCard({ dealer, onPress }) {
  const usedPercent = dealer.creditLimit > 0
    ? (dealer.pendingAmount / dealer.creditLimit) * 100
    : 0;

  const statusVariant = dealer.status === 'blocked' ? 'danger'
    : dealer.pendingAmount > 0 ? 'warning' : 'success';
  const statusLabel = dealer.status === 'blocked' ? 'Blocked'
    : dealer.pendingAmount > 0 ? 'Pending' : 'Clear';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
      <AppCard style={styles.card}>
        <View style={styles.top}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{dealer.name}</Text>
            <Text style={styles.shop}>{dealer.shopName}</Text>
          </View>
          <AppBadge label={statusLabel} variant={statusVariant} />
        </View>

        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${dealer.phone}`)}
          style={styles.phoneRow}
        >
          <Text style={styles.phone}>Ph: {dealer.phone}</Text>
        </TouchableOpacity>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatINR(dealer.pendingAmount)}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{dealer.invoiceCount || 0}</Text>
            <Text style={styles.statLabel}>Invoices</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatINR(dealer.creditLimit)}</Text>
            <Text style={styles.statLabel}>Credit Limit</Text>
          </View>
        </View>

        <CreditBar used={dealer.pendingAmount} limit={dealer.creditLimit} />
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1, marginRight: Spacing.sm },
  name: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  shop: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  phoneRow: { marginTop: Spacing.xs },
  phone: { fontSize: Typography.fontSize.sm, color: Colors.primary },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md, marginBottom: Spacing.sm },
  stat: { alignItems: 'center' },
  statValue: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
