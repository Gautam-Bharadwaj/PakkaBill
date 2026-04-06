import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppCard from '../common/AppCard';
import AppBadge from '../common/AppBadge';
import CreditBar from './CreditBar';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';

export default function DealerCard({ dealer, onPress }) {
  const statusVariant = dealer.status === 'blocked' ? 'danger'
    : dealer.pendingAmount > 0 ? 'warning' : 'success';
  const statusLabel = dealer.status === 'blocked' ? 'BLOCKED'
    : dealer.pendingAmount > 0 ? 'PENDING' : 'CLEAR';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <AppCard style={styles.card} shadow="sm">
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{dealer.name.toUpperCase()}</Text>
            <Text style={styles.shop}>{dealer.shopName.toUpperCase()}</Text>
          </View>
          <AppBadge label={statusLabel} variant={statusVariant} />
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
             <Text style={styles.statLabel}>BALANCE</Text>
             <Text style={[styles.statValue, { color: dealer.pendingAmount > 0 ? Colors.primary : Colors.white }]}>
               {formatINR(dealer.pendingAmount)}
             </Text>
          </View>
          <View style={styles.statCell}>
             <Text style={styles.statLabel}>LIMIT</Text>
             <Text style={styles.statValue}>{formatINR(dealer.creditLimit)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.callAction} 
            onPress={() => Linking.openURL(`tel:${dealer.phone}`)}
          >
             <Feather name="phone-call" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.creditWrap}>
           <CreditBar used={dealer.pendingAmount} limit={dealer.creditLimit} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    marginBottom: Spacing.md, 
    backgroundColor: Colors.surface, 
    borderWidth: 1, 
    borderColor: Colors.border,
    padding: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '900', color: Colors.white, letterSpacing: 0.5 },
  shop: { fontSize: 9, color: Colors.textMuted, marginTop: 4, fontWeight: '800', letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16, opacity: 0.5 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statCell: { flex: 1 },
  statLabel: { fontSize: 8, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '900', color: Colors.white },
  callAction: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: Colors.black, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creditWrap: { marginTop: 16 },
});
