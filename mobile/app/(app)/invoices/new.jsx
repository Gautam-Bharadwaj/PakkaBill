import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import useInvoiceBuilder from '../../../src/hooks/useInvoiceBuilder';
import LineItemRow from '../../../src/components/invoice/LineItemRow';
import InvoiceSummary from '../../../src/components/invoice/InvoiceSummary';
import GSTSelector from '../../../src/components/invoice/GSTSelector';
import ProductPickerModal from '../../../src/components/invoice/ProductPickerModal';
import AppButton from '../../../src/components/common/AppButton';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import AppLoader from '../../../src/components/common/AppLoader';
import AppCard from '../../../src/components/common/AppCard';
import AppInput from '../../../src/components/common/AppInput';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius } from '../../../src/theme/spacing';
import { getDealers } from '../../../src/api/dealer.api';
import useDebounce from '../../../src/hooks/useDebounce';
import { formatINR } from '../../../src/utils/currency';
import logger from '../../../src/utils/logger';

const STEPS = ['Dealer', 'Products', 'Settings', 'Review'];

export default function NewInvoiceScreen() {
  const params = useLocalSearchParams();
  const { createInvoice } = useInvoiceStore();
  const builder = useInvoiceBuilder();
  const [step, setStep] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [dealerSearch, setDealerSearch] = useState('');
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debouncedSearch = useDebounce(dealerSearch, 300);

  React.useEffect(() => {
    (async () => {
      setLoadingDealers(true);
      try {
        const { data } = await getDealers({ q: debouncedSearch, limit: 30 });
        setDealers(data.data || []);
        // Auto-select if dealerId in params
        if (params.dealerId && !builder.dealer) {
          const found = data.data.find((d) => d._id === params.dealerId);
          if (found) { builder.setDealer(found); setStep(1); }
        }
      } catch (err) { logger.error('[NewInvoice] fetch dealers', err); }
      finally { setLoadingDealers(false); }
    })();
  }, [debouncedSearch]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const invoice = await createInvoice(builder.buildPayload());
      builder.reset();
      showMessage({ message: 'Invoice created!', type: 'success', icon: 'success' });
      router.replace(`/(app)/invoices/${invoice._id}`);
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'Failed to create invoice', type: 'danger' });
    } finally { setSubmitting(false); }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Dealer
        return (
          <View style={styles.stepContent}>
            <AppSearchBar value={dealerSearch} onChangeText={setDealerSearch} placeholder="Search dealer..." />
            {loadingDealers ? <AppLoader /> : (
              <FlatList
                data={dealers}
                keyExtractor={(d) => d._id}
                style={styles.dealerList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.dealerItem, builder.dealer?._id === item._id && styles.dealerItemActive]}
                    onPress={() => builder.setDealer(item)}
                  >
                    <Text style={[styles.dealerName, builder.dealer?._id === item._id && styles.dealerNameActive]}>{item.name}</Text>
                    <Text style={styles.dealerShop}>{item.shopName}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <AppButton title="Next →" onPress={() => setStep(1)} disabled={!builder.dealer} fullWidth style={styles.stepBtn} />
          </View>
        );
      case 1: // Products
        return (
          <View style={styles.stepContent}>
            <AppButton title="+ Add Product" onPress={() => setShowPicker(true)} variant="secondary" fullWidth style={styles.addProdBtn} />
            <ScrollView>
              {builder.lineItems.map((item) => (
                <LineItemRow
                  key={item.productId}
                  item={item}
                  onQtyChange={(qty) => builder.updateQty(item.productId, qty)}
                  onRemove={() => builder.removeItem(item.productId)}
                />
              ))}
            </ScrollView>
            {builder.lineItems.length > 0 && (
              <Text style={styles.subtotal}>Subtotal: {formatINR(builder.subtotal)}</Text>
            )}
            <View style={styles.navRow}>
              <AppButton title="← Back" onPress={() => setStep(0)} variant="ghost" style={styles.halfBtn} />
              <AppButton title="Next →" onPress={() => setStep(2)} disabled={builder.lineItems.length === 0} style={styles.halfBtn} />
            </View>
            <ProductPickerModal visible={showPicker} onClose={() => setShowPicker(false)} onSelect={builder.addProduct} />
          </View>
        );
      case 2: // Settings
        return (
          <View style={styles.stepContent}>
            <GSTSelector value={builder.gstRate} onChange={builder.setGstRate} />
            <Text style={styles.label}>Payment Mode</Text>
            <View style={styles.modeRow}>
              {[['full', 'Full'], ['partial', 'Partial'], ['credit', 'Credit']].map(([val, label]) => (
                <TouchableOpacity key={val} style={[styles.modeChip, builder.paymentMode === val && styles.modeActive]} onPress={() => builder.setPaymentMode(val)}>
                  <Text style={[styles.modeText, builder.paymentMode === val && styles.modeTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {builder.paymentMode === 'partial' && (
              <AppInput
                label="Amount Paid ₹"
                value={builder.amountPaid}
                onChangeText={builder.setAmountPaid}
                keyboardType="numeric"
                placeholder={`Max: ${formatINR(builder.totalAmount)}`}
              />
            )}
            <View style={styles.navRow}>
              <AppButton title="← Back" onPress={() => setStep(1)} variant="ghost" style={styles.halfBtn} />
              <AppButton title="Next →" onPress={() => setStep(3)} style={styles.halfBtn} />
            </View>
          </View>
        );
      case 3: // Review
        return (
          <ScrollView style={styles.stepContent}>
            <AppCard style={styles.reviewDealer}>
              <Text style={styles.reviewDealerName}>{builder.dealer?.name}</Text>
              <Text style={styles.reviewDealerShop}>{builder.dealer?.shopName}</Text>
              <Text style={styles.reviewItemCount}>{builder.lineItems.length} item(s)</Text>
            </AppCard>
            <InvoiceSummary
              subtotal={builder.subtotal}
              discountTotal={builder.discountTotal}
              gstRate={builder.gstRate}
              gstAmount={builder.gstAmount}
              totalAmount={builder.totalAmount}
              totalProfit={builder.totalProfit}
              amountPaid={builder.resolvedAmountPaid}
              amountDue={builder.amountDue}
            />
            <View style={styles.navRow}>
              <AppButton title="← Back" onPress={() => setStep(2)} variant="ghost" style={styles.halfBtn} />
              <AppButton title="Create Invoice" onPress={handleSubmit} loading={submitting} style={styles.halfBtn} />
            </View>
          </ScrollView>
        );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>✕</Text></TouchableOpacity>
          <Text style={styles.title}>New Invoice</Text>
          <View style={{ width: 24 }} />
        </View>
        {/* Step indicator */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
            </View>
          ))}
        </View>
        {renderStep()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base },
  back: { fontSize: 20, color: Colors.textSecondary, fontWeight: Typography.fontWeight.bold },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  steps: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.base, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  stepItem: { alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotActive: { backgroundColor: Colors.primary },
  stepNum: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted },
  stepNumActive: { color: Colors.white },
  stepLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  stepLabelActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
  stepContent: { flex: 1, padding: Spacing.base },
  dealerList: { maxHeight: 320, marginTop: Spacing.sm },
  dealerItem: { padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.xs, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  dealerItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLighter },
  dealerName: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  dealerNameActive: { color: Colors.primary },
  dealerShop: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  stepBtn: { marginTop: Spacing.md },
  addProdBtn: { marginBottom: Spacing.md },
  subtotal: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.primary, textAlign: 'right', marginVertical: Spacing.sm },
  navRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  halfBtn: { flex: 1 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  modeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  modeChip: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.white },
  modeActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLighter },
  modeText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },
  modeTextActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
  reviewDealer: { marginBottom: Spacing.md },
  reviewDealerName: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  reviewDealerShop: { fontSize: Typography.fontSize.md, color: Colors.textSecondary },
  reviewItemCount: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, marginTop: 4 },
});
