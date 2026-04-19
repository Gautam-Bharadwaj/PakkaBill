import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Switch, StatusBar, TextInput, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { UserCircle, CheckCircle2, Search, PlusCircle, RefreshCcw } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import useProductStore from '../../../src/store/useProductStore';
import useDealerStore from '../../../src/store/useDealerStore';
import useInvoiceBuilder from '../../../src/hooks/useInvoiceBuilder';
import ProductPickerModal from '../../../src/components/invoice/ProductPickerModal';
import DealerPickerModal from '../../../src/components/invoice/DealerPickerModal';
import LineItemRow from '../../../src/components/invoice/LineItemRow';
import AiGstSuggestion from '../../../src/components/ai/AiGstSuggestion';
import AppHeader from '../../../src/components/common/AppHeader';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { formatINR } from '../../../src/utils/currency';

export default function NewInvoiceScreen() {
  const { dealerId, reorderId, editId } = useLocalSearchParams();
  const { createInvoice, updateInvoice, fetchInvoice } = useInvoiceStore();
  const { recentlyUsed } = useProductStore();
  const { fetchDealer } = useDealerStore();
  const builder = useInvoiceBuilder();
  const [showPicker, setShowPicker] = useState(false);
  const [showDealerPicker, setShowDealerPicker] = useState(false);
  const [batchDealers, setBatchDealers] = useState([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dealerId) {
       fetchDealer(dealerId).then((d) => builder.setDealer(d));
    } else if (!reorderId && !editId) {
       builder.reset();
    }
    
    if (reorderId || editId) {
       const targetId = reorderId || editId;
       fetchInvoice(targetId).then((inv) => {
         if (inv?.lineItems) builder.setReorderItems(inv.lineItems);
         if (inv?.gstRate) builder.setGstRate(inv.gstRate);
       });
    }
  }, [dealerId, reorderId, editId]);

  const handleCreate = async () => {
    const activeDealers = isBulkMode ? batchDealers : (builder.dealer ? [builder.dealer] : []);
    
    if (activeDealers.length === 0) {
        showMessage({ message: 'Error: Please pick at least 1 Customer (Step 1)', type: 'warning' });
        return;
    }
    if (builder.lineItems.length === 0) {
        showMessage({ message: 'Error: Please add at least 1 Item (Step 2)', type: 'warning' });
        return;
    }

    setIsSubmitting(true);
    try {
      if (editId) {
        const inv = await updateInvoice(editId, builder.buildPayload());
        showMessage({ message: 'Bill Updated', type: 'success' });
        router.replace(`/(app)/invoices/${inv._id}`);
      } else {
        // ── BULK CREATION LOGIC ──
        let lastInv;
        for (const d of activeDealers) {
           // Temporarily set dealer for payload building
           builder.setDealer(d);
           lastInv = await createInvoice(builder.buildPayload());
        }

        if (activeDealers.length > 1) {
          showMessage({ message: `${activeDealers.length} Bills Created Successfully!`, type: 'success' });
          router.replace('/(app)/invoices');
        } else {
          showMessage({ message: 'Bill Created Successfully', type: 'success' });
          router.replace(`/(app)/invoices/${lastInv._id}`);
        }
      }
      builder.reset();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action Failed';
      showMessage({ message: `Error: ${msg}`, type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDealerSelect = (data) => {
    if (isBulkMode) {
      setBatchDealers(data);
      builder.setDealer(data[0]); // Preview first
    } else {
      builder.setDealer(data);
      setBatchDealers([]);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title={editId ? "EDIT BILL" : "NEW BILL"} showBack />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* STEP 1: CUSTOMER */}
          <View style={styles.stepHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepNum}>1</Text></View>
            <View style={{ flex: 1 }}>
               <Text style={styles.stepTitle}>CHOOSE CUSTOMER(S)</Text>
               <TouchableOpacity onPress={() => { setIsBulkMode(!isBulkMode); builder.setDealer(null); setBatchDealers([]); }}>
                  <Text style={[styles.bulkToggle, isBulkMode && { color: Colors.primary }]}>
                    {isBulkMode ? '✓ BULK MODE ACTIVE (MULTIPLE)' : '+ ENABLE BULK BILLING?'}
                  </Text>
               </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.miniAddBtn} onPress={() => router.push('/(app)/dealers/add')}>
               <PlusCircle size={14} color={Colors.black} strokeWidth={2.5} />
               <Text style={styles.miniAddText}>NEW</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.bigSelector, (builder.dealer || batchDealers.length > 0) && styles.selectorActive]} 
            onPress={() => setShowDealerPicker(true)}
          >
            {isBulkMode && batchDealers.length > 0 ? (
               <View style={styles.selectionInfo}>
                 <UserCircle size={24} color={Colors.primary} strokeWidth={2} />
                 <View style={styles.textStack}>
                   <Text style={styles.selectionMain}>{batchDealers.length} CUSTOMERS SELECTED</Text>
                   <Text style={styles.selectionSub}>{batchDealers.map(d => d.name).slice(0, 2).join(', ')}...</Text>
                 </View>
                 <RefreshCcw size={18} color={Colors.textMuted} />
               </View>
            ) : builder.dealer ? (
              <View style={styles.selectionInfo}>
                <UserCircle size={24} color={Colors.primary} strokeWidth={2} />
                <View style={styles.textStack}>
                  <Text style={styles.selectionMain}>{builder.dealer.name.toUpperCase()}</Text>
                  <Text style={styles.selectionSub}>{builder.dealer.shopName.toUpperCase()}</Text>
                </View>
                <RefreshCcw size={18} color={Colors.textMuted} strokeWidth={2} />
              </View>
            ) : (
              <View style={styles.placeholderRow}>
                <Search size={22} color={Colors.textMuted} strokeWidth={2} />
                <Text style={styles.placeholderText}>SEARCH OR PICK CUSTOMER...</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* STEP 2: ITEMS */}
          <View style={[styles.stepHeader, { marginTop: 32 }]}>
            <View style={styles.stepCircle}><Text style={styles.stepNum}>2</Text></View>
            <Text style={styles.stepTitle}>ADD ITEMS TO BILL</Text>
          </View>

          {!!(recentlyUsed.length > 0 && !builder.lineItems.length) && (
            <View style={styles.quickAdd}>
               <Text style={styles.smallLabel}>QUICK ADD RECENT ITEMS:</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                 {recentlyUsed.map(p => (
                   <TouchableOpacity key={p._id} style={styles.miniChip} onPress={() => builder.addProduct(p)}>
                     <Text style={styles.miniChipName} numberOfLines={1}>{p.name}</Text>
                     <Text style={styles.miniChipPrice}>{formatINR(p.sellingPrice)}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
            </View>
          )}

          <TouchableOpacity style={styles.addItemFullBtn} onPress={() => setShowPicker(true)}>
            <PlusCircle size={22} color={Colors.black} strokeWidth={2.5} />
            <Text style={styles.addItemFullText}>SEARCH & ADD NEW ITEM</Text>
          </TouchableOpacity>

          <View style={styles.itemsList}>
            {builder.lineItems.map(item => (
              <LineItemRow 
                key={item.productId} 
                item={item} 
                onQtyChange={(qty) => builder.updateQty(item.productId, qty)} 
                onRemove={() => builder.removeItem(item.productId)} 
              />
            ))}
          </View>

          {/* STEP 3: TAX & FINAL */}
          {!!builder.lineItems.length && (
            <View style={[styles.stepHeader, { marginTop: 32 }]}>
              <View style={styles.stepCircle}><Text style={styles.stepNum}>3</Text></View>
              <Text style={styles.stepTitle}>REVIEW & TAX</Text>
            </View>
          )}

          {!!builder.lineItems.length && (
            <>
              <AiGstSuggestion 
                lineItems={builder.lineItems} 
                onSuggestGst={(rate) => builder.setGstRate(rate)} 
              />
              <AppCard style={styles.finalCard}>
               <View style={styles.taxToggle}>
                  <View>
                    <Text style={styles.taxLabel}>APPLY 18% GST TAX?</Text>
                    <Text style={styles.taxValue}>GST AMOUNT: {formatINR(builder.gstAmount)}</Text>
                  </View>
                  <Switch 
                    value={builder.gstRate === 18} 
                    onValueChange={(v) => builder.setGstRate(v ? 18 : 0)} 
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                  />
               </View>
               <View style={styles.divider} />

               {/* PAYMENT SECTION */}
               <View style={{ marginBottom: 20 }}>
                 <Text style={styles.taxLabel}>PAYMENT RECEIVED NOW</Text>
                 <View style={styles.paymentRow}>
                   <TouchableOpacity 
                     style={[styles.payModeBtn, builder.paymentMode === 'full' && styles.payModeBtnActive]}
                     onPress={() => { builder.setPaymentMode('full'); builder.setAmountPaid(builder.totalAmount.toString()); }}
                   >
                     <Text style={[styles.payModeText, builder.paymentMode === 'full' && styles.payModeTextActive]}>FULL</Text>
                   </TouchableOpacity>

                   <TouchableOpacity 
                     style={[styles.payModeBtn, builder.paymentMode === 'credit' && styles.payModeBtnActive]}
                     onPress={() => { builder.setPaymentMode('credit'); builder.setAmountPaid(''); }}
                   >
                     <Text style={[styles.payModeText, builder.paymentMode === 'credit' && styles.payModeTextActive]}>NONE (CREDIT)</Text>
                   </TouchableOpacity>

                   <TouchableOpacity 
                     style={[styles.payModeBtn, builder.paymentMode === 'partial' && styles.payModeBtnActive]}
                     onPress={() => { builder.setPaymentMode('partial'); builder.setAmountPaid(''); }}
                   >
                     <Text style={[styles.payModeText, builder.paymentMode === 'partial' && styles.payModeTextActive]}>PARTIAL</Text>
                   </TouchableOpacity>
                 </View>

                 {builder.paymentMode === 'partial' && (
                   <View style={styles.amountInputWrap}>
                     <Text style={styles.currencySymbol}>₹</Text>
                     <TextInput 
                       style={styles.amountInput}
                       placeholder="Enter amount paid..."
                       placeholderTextColor={Colors.textMuted}
                       keyboardType="numeric"
                       value={builder.amountPaid}
                       onChangeText={builder.setAmountPaid}
                     />
                   </View>
                 )}
               </View>
               <View style={styles.divider} />

               <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>FINAL BILL TOTAL:</Text>
                  <Text style={styles.finalValue}>{formatINR(builder.totalAmount)}</Text>
               </View>
               
               {(builder.paymentMode === 'partial' || builder.paymentMode === 'credit') && (
                 <View style={[styles.finalRow, { marginTop: 12 }]}>
                    <Text style={styles.taxLabel}>PENDING DUES:</Text>
                    <Text style={[styles.finalValue, { color: Colors.danger, fontSize: 18 }]}>
                      {formatINR(builder.amountDue)}
                    </Text>
                 </View>
               )}
            </AppCard>
            </>
          )}

          <View style={{ height: 160 }} />
        </ScrollView>

        <View style={styles.bottomBar}>
           <TouchableOpacity 
             style={[styles.mainActionBtn, !!(isSubmitting || !builder.dealer || !builder.lineItems.length) && { opacity: 0.5 }]} 
             onPress={handleCreate}
             disabled={isSubmitting || !builder.dealer || !builder.lineItems.length}
           >
              <CheckCircle2 size={24} color={Colors.black} strokeWidth={2.5} />
              <Text style={styles.mainActionText}>
                {isSubmitting ? 'SAVING...' : editId ? 'SAVE CHANGES' : 'CREATE & SAVE BILL'}
              </Text>
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ProductPickerModal visible={showPicker} onClose={() => setShowPicker(false)} onSelect={builder.addProduct} />
      <DealerPickerModal visible={showDealerPicker} onClose={() => setShowDealerPicker(false)} onSelect={onDealerSelect} multiSelect={isBulkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 150 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 14, fontWeight: '900', color: Colors.black },
  stepTitle: { fontSize: 12, fontWeight: '800', color: Colors.white, letterSpacing: 1.5 },
  bulkToggle: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, marginTop: 4, letterSpacing: 0.5 },
  miniAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 6 },
  miniAddText: { fontSize: 10, fontWeight: '900', color: Colors.black, letterSpacing: 0.5 },
  bigSelector: { 
    backgroundColor: Colors.surface, 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 2, 
    borderColor: Colors.border,
    minHeight: 80,
    justifyContent: 'center',
  },
  selectorActive: { borderColor: Colors.primary },
  placeholderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  placeholderText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  selectionInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  textStack: { flex: 1 },
  selectionMain: { fontSize: 17, fontWeight: '800', color: Colors.white },
  selectionSub: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  quickAdd: { marginBottom: 20 },
  smallLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, marginBottom: 10, letterSpacing: 1 },
  miniChip: { backgroundColor: Colors.surface, padding: 12, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  miniChipName: { fontSize: 10, fontWeight: '700', color: Colors.white, width: 80 },
  miniChipPrice: { fontSize: 11, fontWeight: '700', color: Colors.primary, marginTop: 4 },
  addItemFullBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: Colors.white, 
    padding: 18, 
    borderRadius: 16, 
    gap: 12, 
    marginBottom: 24 
  },
  addItemFullText: { fontSize: 15, fontWeight: '800', color: Colors.black },
  itemsList: { marginBottom: 16 },
  finalCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 24, borderWidth: 2, borderColor: Colors.border },
  taxToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taxLabel: { fontSize: 13, fontWeight: '800', color: Colors.white },
  taxValue: { fontSize: 11, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
  finalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  finalLabel: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  finalValue: { fontSize: 24, fontWeight: '900', color: Colors.white },
  paymentRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  payModeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  payModeBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  payModeText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  payModeTextActive: { color: Colors.primary },
  amountInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, marginTop: 12, borderWidth: 1, borderColor: Colors.border },
  currencySymbol: { fontSize: 18, color: Colors.white, fontWeight: '700', marginRight: 8 },
  amountInput: { flex: 1, height: 50, color: Colors.white, fontSize: 16, fontWeight: '600' },
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: Colors.black, 
    padding: 24, 
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  mainActionBtn: { 
    backgroundColor: Colors.primary, 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  mainActionText: { fontSize: 17, fontWeight: '900', color: Colors.black },
});
