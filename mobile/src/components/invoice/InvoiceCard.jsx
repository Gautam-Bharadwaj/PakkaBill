import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import AppBadge from '../common/AppBadge';
import { Colors } from '../../theme/colors';
import { formatINR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { PlusCircle, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function InvoiceCard({ invoice, onPress }) {
  const statusColor = {
    paid: Colors.success,
    partial: Colors.primary,
    unpaid: Colors.error || '#FF3333',
  }[invoice.paymentStatus] || Colors.textMuted;

  const handleQuickPay = (e) => {
    e.stopPropagation();
    router.push(`/(app)/payments/${invoice._id}`);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <AppCard style={styles.card} padded={false}>
        <View style={styles.header}>
          <View style={styles.billBadge}>
            <Text style={styles.billNo}>#{ (invoice.invoiceId || 'INV-000').split('-').pop()?.toUpperCase() }</Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
             <Text style={styles.statusText}>{ (invoice.paymentStatus || 'unknown').toUpperCase() }</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.mainInfo}>
             <Text style={styles.customerName} numberOfLines={1}>{ (invoice.dealerName || invoice.dealer?.name || 'Customer').toUpperCase() }</Text>
             <Text style={styles.shopName} numberOfLines={1}>{ (invoice.dealerShop || invoice.dealer?.shopName || 'No Shop').toUpperCase() }</Text>
          </View>
          <View style={styles.amountInfo}>
             <Text style={styles.amountLabel}>AMOUNT</Text>
             <Text style={styles.amountValue}>{formatINR(invoice.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
             <Text style={styles.date}>{formatDate(invoice.createdAt, 'dd MMM, yyyy')}</Text>
             {invoice.amountDue > 0 && (
               <View style={styles.dueBox}>
                  <Text style={styles.dueLabel}>DUE: {formatINR(invoice.amountDue)}</Text>
               </View>
             )}
          </View>
          
          {invoice.amountDue > 0 ? (
            <TouchableOpacity style={styles.collectBtn} onPress={handleQuickPay}>
               <PlusCircle size={14} color={Colors.black} strokeWidth={2.5} />
               <Text style={styles.collectText}>COLLECT</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.viewBtn}>
               <ArrowRight size={16} color={Colors.primary} strokeWidth={2} />
            </View>
          )}
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  billBadge: { backgroundColor: Colors.black, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Colors.border },
  billNo: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  statusIndicator: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '900', color: Colors.black, letterSpacing: 0.5 },
  body: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainInfo: { flex: 1, marginRight: 12 },
  customerName: { fontSize: 16, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  shopName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginTop: 4 },
  amountInfo: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1, marginBottom: 2 },
  amountValue: { fontSize: 18, fontWeight: '900', color: Colors.white },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  date: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  dueBox: { backgroundColor: 'rgba(255, 51, 51, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  dueLabel: { fontSize: 9, color: '#FF3333', fontWeight: '900' },
  collectBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    gap: 6,
  },
  collectText: { fontSize: 10, fontWeight: '900', color: Colors.black, letterSpacing: 0.5 },
  viewBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
});
