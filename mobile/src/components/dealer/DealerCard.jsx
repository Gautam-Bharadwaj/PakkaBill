import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Phone, MapPin, ChevronRight, UserCircle } from 'lucide-react-native';
import AppCard from '../common/AppCard';
import AppBadge from '../common/AppBadge';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';

export default function DealerCard({ dealer, onPress }) {
  const statusVariant = dealer.status === 'blocked' ? 'danger'
    : dealer.pendingAmount > 0 ? 'warning' : 'success';
  const statusLabel = dealer.status === 'blocked' ? 'BLOCKED'
    : dealer.pendingAmount > 0 ? 'PENDING' : 'CLEAR';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.wrapper}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
             <UserCircle size={28} color={Colors.primary} strokeWidth={2.5} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{dealer.name.toUpperCase()}</Text>
            <Text style={styles.shop}>{dealer.shopName.toUpperCase()}</Text>
          </View>
          <AppBadge label={statusLabel} variant={statusVariant} />
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
             <Text style={styles.statLabel}>BALANCE DUE</Text>
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
            onPress={() => Linking.openURL(`tel:${dealer.phone}`).catch(() => console.log('Dialer unavailable'))}
          >
             <Phone size={20} color={Colors.black} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  card: { 
    backgroundColor: Colors.surface, 
    borderWidth: 1.5, 
    borderColor: Colors.border,
    padding: 24,
    borderRadius: 24,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '900', color: Colors.white, letterSpacing: 0.5 },
  shop: { fontSize: 10, color: Colors.textMuted, marginTop: 4, fontWeight: '700', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20, opacity: 0.3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statCell: { flex: 1 },
  statLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: '900', color: Colors.white },
  callAction: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
