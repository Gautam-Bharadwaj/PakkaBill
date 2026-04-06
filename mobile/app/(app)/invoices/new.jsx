import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Switch, StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import useProductStore from '../../../src/store/useProductStore';
import useDealerStore from '../../../src/store/useDealerStore';
import useInvoiceBuilder from '../../../src/hooks/useInvoiceBuilder';
import ProductPickerModal from '../../../src/components/invoice/ProductPickerModal';
import LineItemRow from '../../../src/components/invoice/LineItemRow';
import AppHeader from '../../../src/components/common/AppHeader';
import AppButton from '../../../src/components/common/AppButton';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';

export default function NewInvoiceScreen() {
  const { dealerId } = useLocalSearchParams();
  const { createInvoice } = useInvoiceStore();
  const { recentlyUsed } = useProductStore();
  const { fetchDealer, currentDealer } = useDealerStore();
  const builder = useInvoiceBuilder();
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fetch dealer if passed in URL
  useEffect(() => {
    if (dealerId) {
      fetchDealer(dealerId).then((d) => builder.setDealer(d));
    }
  }, [dealerId]);

  const handleGenerate = async () => {
    if (!builder.dealer) {
      showMessage({ message: 'Select an Account/Customer', type: 'warning' });
      return;
    }
    if (builder.lineItems.length === 0) {
      showMessage({ message: 'Cart is empty!', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const invoice = await createInvoice(builder.buildPayload());
      builder.reset();
      showMessage({ message: 'BILL GENERATED SUCCESSFULLY', type: 'success' });
      router.replace(`/(app)/invoices/${invoice._id}`);
    } catch (err) {
      showMessage({ message: 'BILL GENERATION FAILED', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="BILLING ENGINE" showBack />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
      >
        <ScrollView 
          style={styles.flex} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Account Selection Card */}
          <AppCard style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Feather name="shield" size={12} color={Colors.primary} />
              <Text style={styles.cardTitle}>SECURITY / AUTHORIZED ACCOUNT</Text>
            </View>
            {builder.dealer ? (
              <View style={styles.selectedRow}>
                <View>
                  <Text style={styles.mainText}>{builder.dealer.name.toUpperCase()}</Text>
                  <Text style={styles.subText}>{builder.dealer.shopName.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={() => builder.setDealer(null)} style={styles.actionIconBtn}>
                  <Feather name="refresh-cw" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.selector}
                onPress={() => router.push('/(app)/dealers')}
              >
                <Text style={styles.placeholder}>SEARCH DEALER ACCOUNT...</Text>
                <Feather name="search" size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </AppCard>

          {/* Smart Suggestions | Top 10 Recently Used */}
          {recentlyUsed.length > 0 && (
            <View style={styles.smartSection}>
              <Text style={styles.sectionLabel}>SMART SUGGESTIONS (RECENT)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
                {recentlyUsed.map((p) => (
                  <TouchableOpacity 
                    key={p._id} 
                    style={styles.recentChip}
                    onPress={() => builder.addProduct(p)}
                  >
                    <Text style={styles.recentName} numberOfLines={1}>{p.name.toUpperCase()}</Text>
                    <Text style={styles.recentPrice}>{formatINR(p.sellingPrice)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Billing Cart Section */}
          <View style={styles.cartHeader}>
             <Text style={styles.sectionLabel}>TRANSACTION ITEMS</Text>
             <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
                <Feather name="plus-square" size={16} color={Colors.black} />
                <Text style={styles.addBtnText}>ADD SKU</Text>
             </TouchableOpacity>
          </View>

          {builder.lineItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="grid" size={32} color={Colors.border} />
              <Text style={styles.emptyTitle}>NO ITEMS IN QUEUE</Text>
              <Text style={styles.emptySub}>USE SEARCH OR SMART SUGGESTIONS</Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {builder.lineItems.map((item) => (
                <LineItemRow
                  key={item.productId}
                  item={item}
                  onQtyChange={(qty) => builder.updateQty(item.productId, qty)}
                  onRemove={() => builder.removeItem(item.productId)}
                />
              ))}
            </View>
          )}

          {/* Compliance Configuration */}
          <View style={styles.complianceCard}>
            <View style={styles.complianceRow}>
              <View>
                <Text style={styles.compTitle}>GOVERNMENT COMPLIANCE (GST)</Text>
                <Text style={styles.compSub}>APPLY 18% TAX TO NET TOTAL</Text>
              </View>
              <Switch 
                value={builder.gstRate === 18}
                onValueChange={(v) => builder.setGstRate(v ? 18 : 0)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>
          </View>

          {/* Spacing for Footer */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Industrial Footer Readout */}
        <View style={styles.footer}>
           <View style={styles.totalBlock}>
              <Text style={styles.totalSymbol}>₹</Text>
              <Text style={styles.totalValue}>{formatINR(builder.totalAmount).replace('₹', '')}</Text>
           </View>
           <View style={styles.footerActions}>
              <View style={styles.summaryRow}>
                 <Text style={styles.summaryText}>{builder.lineItems.length} SKUs IN QUEUE</Text>
                 <Text style={styles.gstText}>GST: {formatINR(builder.gstAmount)}</Text>
              </View>
              <AppButton 
                title="FINALISE & GENERATE"
                onPress={handleGenerate}
                loading={isSubmitting}
                style={styles.genBtn}
              />
           </View>
        </View>
      </KeyboardAvoidingView>

      <ProductPickerModal 
        visible={showPicker} 
        onClose={() => setShowPicker(false)} 
        onSelect={builder.addProduct} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionCard: { backgroundColor: Colors.surface, padding: 16, borderLeftWidth: 4, borderLeftColor: Colors.primary, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, letterSpacing: 2, marginLeft: 8 },
  selectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainText: { fontSize: 16, fontWeight: '900', color: Colors.white, letterSpacing: 0.5 },
  subText: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, marginTop: 2, letterSpacing: 1 },
  actionIconBtn: { padding: 8, backgroundColor: Colors.black, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  placeholder: { fontSize: 13, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  smartSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 2, marginBottom: 12 },
  recentScroll: { paddingVertical: 4 },
  recentChip: { 
    backgroundColor: Colors.surface, 
    padding: 12, 
    borderRadius: 10, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: Colors.border,
    minWidth: 120,
  },
  recentName: { fontSize: 9, fontWeight: '900', color: Colors.white, letterSpacing: 0.5 },
  recentPrice: { fontSize: 11, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 6 
  },
  addBtnText: { fontSize: 9, fontWeight: '900', color: Colors.black, marginLeft: 6, letterSpacing: 1 },
  emptyCard: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40, 
    backgroundColor: Colors.surface, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: Colors.border, 
    borderStyle: 'dashed' 
  },
  emptyTitle: { fontSize: 11, fontWeight: '900', color: Colors.white, marginTop: 16, letterSpacing: 2 },
  emptySub: { fontSize: 8, fontWeight: '800', color: Colors.textMuted, marginTop: 4, letterSpacing: 1.5 },
  itemsList: { marginBottom: 16 },
  complianceCard: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  complianceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compTitle: { fontSize: 10, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  compSub: { fontSize: 8, fontWeight: '800', color: Colors.textSecondary, marginTop: 2, letterSpacing: 1 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: Colors.black, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalBlock: { flexDirection: 'row', alignItems: 'flex-start' },
  totalSymbol: { fontSize: 14, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  totalValue: { fontSize: 36, fontWeight: '900', color: Colors.white, letterSpacing: -1.5 },
  footerActions: { alignItems: 'flex-end' },
  summaryRow: { alignItems: 'flex-end', marginBottom: 16 },
  summaryText: { fontSize: 9, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  gstText: { fontSize: 10, fontWeight: '900', color: Colors.primary, marginTop: 2 },
  genBtn: { paddingHorizontal: 24, borderRadius: 8 },
});
