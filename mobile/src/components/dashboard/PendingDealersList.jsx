import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';
import { openWhatsApp, buildReminderMessage } from '../../utils/whatsapp';
import AppCard from '../common/AppCard';

export default function PendingDealersList({ dealers = [] }) {
  if (!dealers.length) return null;

  return (
    <AppCard style={styles.card}>
      <Text style={styles.sectionTitle}>Pending Payments</Text>
      {dealers.map((dealer) => (
        <View key={dealer._id} style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{dealer.name}</Text>
            <Text style={styles.shop}>{dealer.shopName}</Text>
          </View>
          <Text style={styles.amount}>{formatINR(dealer.pendingAmount)}</Text>
          <TouchableOpacity
            style={styles.remindBtn}
            onPress={() => openWhatsApp(dealer.phone, buildReminderMessage(dealer, dealer.pendingAmount))}
          >
            <Text style={styles.remindText}>Remind</Text>
          </TouchableOpacity>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.divider },
  info: { flex: 1 },
  name: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  shop: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  amount: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.danger, marginHorizontal: Spacing.sm },
  remindBtn: { backgroundColor: Colors.successLight, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.sm },
  remindText: { fontSize: Typography.fontSize.xs, color: Colors.success, fontWeight: Typography.fontWeight.semibold },
});
