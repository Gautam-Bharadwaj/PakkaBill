import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Switch, StatusBar, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { UserCircle, CheckCircle2, Search, PlusCircle, RefreshCcw } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import useProductStore from '../../../src/store/useProductStore';
import useDealerStore from '../../../src/store/useDealerStore';
import useInvoiceBuilder from '../../../src/hooks/useInvoiceBuilder';
import ProductPickerModal from '../../../src/components/invoice/ProductPickerModal';
import LineItemRow from '../../../src/components/invoice/LineItemRow';
import AppHeader from '../../../src/components/common/AppHeader';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { formatINR } from '../../../src/utils/currency';

export default function NewInvoiceScreen() {
  const { dealerId, reorderId } = useLocalSearchParams();
  const { createInvoice, fetchInvoice } = useInvoiceStore();
  const { recentlyUsed } = useProductStore();
  const { fetchDealer } = useDealerStore();
  const builder = useInvoiceBuilder();
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dealerId) {
       fetchDealer(dealerId).then((d) => builder.setDealer(d));
    } else if (!reorderId) {
       // If no params, and not a reorder, ensure we start fresh
       builder.reset();
    }
    
    if (reorderId) {
       fetchInvoice(reorderId).then((inv) => {
         if (inv?.lineItems) builder.setReorderItems(inv.lineItems);
         if (inv?.gstRate) builder.setGstRate(inv.gstRate);
       });
    }
  }, [dealerId, reorderId]);

  const handleCreate = async () => {
    if (!builder.dealer) {
        showMessage({ message: 'Error: Please pick a Customer first (Step 1)', type: 'warning' });
        return;
    }
    if (builder.lineItems.length === 0) {
        showMessage({ message: 'Error: Please add at least 1 Item (Step 2)', type: 'warning' });
        return;
    }
    setIsSubmitting(true);
    try {
      const inv = await createInvoice(builder.buildPayload());
      builder.reset();
      showMessage({ message: 'Success! Bill Created Successfully', type: 'success' });
      router.replace(`/(app)/invoices/${inv._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Bill Generation Failed';
      showMessage({ message: `Error: ${msg}`, type: 'danger', icon: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="NEW BILL (EASY)" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* STEP 1: CUSTOMER */}
          <View style={styles.stepHeader}>
            <View style={styles.stepCircle}><Text style={styles.stepNum}>1</Text></View>
            <Text style={styles.stepTitle}>CHOOSE CUSTOMER</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.bigSelector, !!builder.dealer && styles.selectorActive]} 
            onPress={() => router.push('/(app)/dealers')}
          >
            {builder.dealer ? (
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
               <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>FINAL BILL TOTAL:</Text>
                  <Text style={styles.finalValue}>{formatINR(builder.totalAmount)}</Text>
               </View>
            </AppCard>
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
              <Text style={styles.mainActionText}>{isSubmitting ? 'CREATING BILL...' : 'CREATE & SAVE BILL'}</Text>
           </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ProductPickerModal visible={showPicker} onClose={() => setShowPicker(false)} onSelect={builder.addProduct} />
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
