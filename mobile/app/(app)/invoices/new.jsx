import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Switch, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import useInvoiceBuilder from '../../../src/hooks/useInvoiceBuilder';
import ProductPickerModal from '../../../src/components/invoice/ProductPickerModal';
import LineItemRow from '../../../src/components/invoice/LineItemRow';
import AppHeader from '../../../src/components/common/AppHeader';
import AppButton from '../../../src/components/common/AppButton';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';

export default function NewInvoiceScreen() {
  const { createInvoice } = useInvoiceStore();
  const builder = useInvoiceBuilder();
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async () => {
    if (builder.lineItems.length === 0) {
      showMessage({ message: 'Bill empty! Add items.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const invoice = await createInvoice(builder.buildPayload());
      builder.reset();
      showMessage({ message: 'Bill Generated Successfully!', type: 'success' });
      router.replace(`/(app)/invoices/${invoice._id}`);
    } catch (err) {
      showMessage({ message: 'Error generating bill', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      {/* Normalized Top Navbar */}
      <AppHeader 
        title="BILLING ENGINE" 
        showBack={true} 
        onBack={() => router.back()} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
      >
        <ScrollView 
          style={styles.flex} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Customer Selection */}
          <AppCard style={styles.customerCard} shadow="sm">
            <View style={styles.cardHeader}>
              <Feather name="user" size={14} color={Colors.primary} />
              <Text style={styles.cardTitle}>ACCOUNT OWNER</Text>
            </View>
            {builder.dealer ? (
              <View style={styles.selectedDealer}>
                <View style={styles.dealerInfo}>
                  <Text style={styles.dealerName}>{builder.dealer.name}</Text>
                  <Text style={styles.dealerShop}>{builder.dealer.shopName}</Text>
                </View>
                <TouchableOpacity onPress={() => builder.setDealer(null)} style={styles.editBtn}>
                  <Feather name="edit" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.selectBtn}
                onPress={() => router.push('/(app)/dealers')}
              >
                <Text style={styles.placeholderText}>SEARCH ACCOUNT OR GUEST</Text>
                <Feather name="search" size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </AppCard>

          {/* Cart Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRANSACTION ITEMS</Text>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => setShowPicker(true)}
            >
              <Feather name="plus-circle" size={16} color={Colors.black} />
              <Text style={styles.addBtnText}>ADD ITEM</Text>
            </TouchableOpacity>
          </View>

          {/* Items */}
          {builder.lineItems.length === 0 ? (
            <View style={styles.emptyZone}>
              <Feather name="package" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>EMPTY CART</Text>
              <Text style={styles.emptySub}>TAP "ADD ITEM" TO BEGIN</Text>
            </View>
          ) : (
            <View style={styles.cartList}>
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

          {/* Configuration */}
          <AppCard style={styles.taxCard} shadow="sm">
            <View style={styles.taxRow}>
              <View>
                <Text style={styles.taxLabel}>APPLY GST (18%)</Text>
                <Text style={styles.taxSub}>GOV. COMPLIANT INVOICE</Text>
              </View>
              <Switch 
                value={builder.gstRate === 18}
                onValueChange={(val) => builder.setGstRate(val ? 18 : 0)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </AppCard>

          <View style={{ height: 160 }} />
        </ScrollView>

        {/* Action Panel */}
        <View style={styles.footer}>
          <View style={styles.totalRow}>
             <View>
                <Text style={styles.totalLabel}>NET PAYABLE</Text>
                <Text style={styles.totalValue}>{formatINR(builder.totalAmount)}</Text>
             </View>
             <View style={styles.summaryStats}>
                <Text style={styles.itemCount}>{builder.lineItems.length} ITEMS</Text>
                {builder.gstAmount > 0 && <Text style={styles.taxHint}>GST: {formatINR(builder.gstAmount)}</Text>}
             </View>
          </View>
          <AppButton 
            title="CONFIRM & GENERATE" 
            onPress={handleGenerate}
            loading={isSubmitting}
            size="lg"
            variant="primary"
            style={styles.genBtn}
          />
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
  scrollContent: { padding: Spacing.base },
  customerCard: { marginBottom: 24, padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { 
    fontSize: 9, 
    fontWeight: '900', 
    color: Colors.textSecondary,
    marginLeft: 8,
    letterSpacing: 2,
  },
  selectBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  placeholderText: { fontSize: 13, color: Colors.white, fontWeight: '700', letterSpacing: 1 },
  selectedDealer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dealerName: { fontSize: 16, fontWeight: '900', color: Colors.white },
  dealerShop: { fontSize: 10, color: Colors.textSecondary, marginTop: 4, fontWeight: '700', letterSpacing: 1 },
  editBtn: { padding: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: Colors.black, fontSize: 10, fontWeight: '900', marginLeft: 6 },
  emptyZone: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  emptyText: { color: Colors.white, marginTop: 16, fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  emptySub: { color: Colors.textMuted, marginTop: 6, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  cartList: { marginBottom: 24 },
  taxCard: { marginBottom: 24, padding: 20 },
  taxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taxLabel: { fontSize: 13, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  taxSub: { fontSize: 9, color: Colors.textSecondary, marginTop: 4, fontWeight: '800', letterSpacing: 1 },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: { fontSize: 9, color: Colors.textSecondary, fontWeight: '800', letterSpacing: 2 },
  totalValue: { fontSize: 30, fontWeight: '900', color: Colors.primary, letterSpacing: -1 },
  summaryStats: { alignItems: 'flex-end' },
  itemCount: { fontSize: 11, color: Colors.white, fontWeight: '900', letterSpacing: 1 },
  taxHint: { fontSize: 10, color: Colors.primary, fontWeight: '800', marginTop: 4 },
  genBtn: { borderRadius: Radius.md },
});
