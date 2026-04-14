import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Linking, TouchableOpacity, StatusBar,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import useDealerStore from '../../../src/store/useDealerStore';
import CreditBar from '../../../src/components/dealer/CreditBar';
import InvoiceCard from '../../../src/components/invoice/InvoiceCard';
import AppHeader from '../../../src/components/common/AppHeader';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import AppButton from '../../../src/components/common/AppButton';
import AppEmpty from '../../../src/components/common/AppEmpty';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radius } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';
import { openWhatsApp, buildReminderMessage } from '../../../src/utils/whatsapp';
import { getDealerInvoices } from '../../../src/api/dealer.api';

export default function DealerProfileScreen() {
  const { id } = useLocalSearchParams();
  const { currentDealer: dealer, isLoading, error, fetchDealer } = useDealerStore();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchDealer(id);
    getDealerInvoices(id, { limit: 10 }).then(({ data }) => setInvoices(data.data || [])).catch(() => {});
  }, [id]);

  if (isLoading) return <AppLoader fullScreen label="LOADING PROFILE..." />;
  if (error || !dealer) return <AppError message={error || 'DEALER NOT FOUND'} onRetry={() => fetchDealer(id)} />;

  const RightAction = (
    <TouchableOpacity onPress={() => router.push(`/(app)/dealers/${id}/edit`)}>
      <Feather name="edit-3" size={20} color={Colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="ACCOUNT PROFILE" showBack rightAction={RightAction} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Section */}
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
             <Text style={styles.avatarInitial}>{dealer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{dealer.name.toUpperCase()}</Text>
          <Text style={styles.shop}>{dealer.shopName.toUpperCase()}</Text>
          <TouchableOpacity 
            style={styles.phoneTag}
            onPress={() => Linking.openURL(`tel:${dealer.phone}`).catch(() => showMessage({ message: 'Dialer unavailable in simulator', type: 'info' }))}
          >
            <Feather name="phone" size={12} color={Colors.primary} />
            <Text style={styles.phoneText}> +91 {dealer.phone}</Text>
          </TouchableOpacity>
        </View>

        {/* Credit Utility */}
        <View style={styles.utilitySection}>
           <Text style={styles.sectionLabel}>CREDIT STATUS</Text>
           <CreditBar used={dealer.pendingAmount} limit={dealer.creditLimit} />
        </View>

        {/* High-Contrast Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
             <Text style={styles.statVal}>{dealer.invoiceCount || 0}</Text>
             <Text style={styles.statLabel}>BILLS</Text>
          </View>
          <View style={styles.statBox}>
             <Text style={[styles.statVal, { color: Colors.primary }]}>{formatINR(dealer.pendingAmount || 0)}</Text>
             <Text style={styles.statLabel}>PENDING</Text>
          </View>
          <View style={styles.statBox}>
             <Text style={styles.statVal}>{formatINR(dealer.totalPurchased || 0)}</Text>
             <Text style={styles.statLabel}>PURCHASED</Text>
          </View>
        </View>

        {/* Critical Actions Row */}
        <View style={styles.actionGrid}>
          <AppButton
            title="NEW BILL"
            onPress={() => router.push(`/(app)/invoices/new?dealerId=${id}`)}
            style={styles.actionBtn}
          />
          <AppButton
            title="REMIND"
            variant="success"
            onPress={() => openWhatsApp(dealer.phone, buildReminderMessage(dealer, dealer.pendingAmount))}
            style={styles.actionBtn}
          />
          <AppButton
            title="CALL"
            variant="secondary"
            onPress={() => Linking.openURL(`tel:${dealer.phone}`).catch(() => showMessage({ message: 'Dialer unavailable in simulator', type: 'info' }))}
            style={styles.actionBtn}
          />
        </View>

        {/* Transaction History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>RECENT TRANSACTIONS</Text>
          {invoices.length === 0 ? (
            <AppEmpty title="NO BILLING HISTORY" />
          ) : (
            invoices.map((inv) => (
              <InvoiceCard 
                key={inv._id} 
                invoice={inv} 
                onPress={() => router.push(`/(app)/invoices/${inv._id}`)} 
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 60 },
  hero: { 
    alignItems: 'center', 
    paddingVertical: 32, 
    backgroundColor: Colors.black,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: Colors.surface, 
    borderWidth: 2, 
    borderColor: Colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitial: { fontSize: 32, fontWeight: '900', color: Colors.primary },
  name: { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  shop: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 2, marginTop: 4 },
  phoneTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 16, 
    backgroundColor: Colors.surface, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phoneText: { fontSize: 11, fontWeight: '900', color: Colors.primary },
  utilitySection: { padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: Colors.textMuted, letterSpacing: 2, marginBottom: 16 },
  statsGrid: { flexDirection: 'row', padding: 20, gap: 12 },
  statBox: { 
    flex: 1, 
    backgroundColor: Colors.surface, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statVal: { fontSize: 15, fontWeight: '900', color: Colors.white },
  statLabel: { fontSize: 8, fontWeight: '800', color: Colors.textMuted, marginTop: 4, letterSpacing: 1 },
  actionGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 32 },
  actionBtn: { flex: 1 },
  historySection: { paddingHorizontal: 20 },
});
