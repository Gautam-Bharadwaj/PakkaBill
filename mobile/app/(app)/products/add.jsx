import React from 'react';
import { ScrollView, View, Text, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { PackagePlus, TrendingUp, Info } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import useProductStore from '../../../src/store/useProductStore';
import AppHeader from '../../../src/components/common/AppHeader';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';

const schema = z.object({
  name: z.string().min(1, 'PRODUCT NAME IS REQUIRED'),
  sku: z.string().min(1, 'SKU CODE IS REQUIRED'),
  sellingPrice: z.string().refine((v) => !isNaN(+v) && +v > 0, 'INVALID SELLING PRICE'),
  paper: z.string().default('0'),
  printing: z.string().default('0'),
  binding: z.string().default('0'),
  other: z.string().default('0'),
  batchSize: z.string().default('1').refine((v) => !isNaN(+v) && +v > 0, 'INVALID BATCH SIZE'),
  stockQuantity: z.string().default('0'),
  lowStockThreshold: z.string().default('10'),
});

export default function AddProductScreen() {
  const { createProduct } = useProductStore();
  const { control, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { 
      name: '', sku: '', sellingPrice: '', 
      paper: '0', printing: '0', binding: '0', other: '0', 
      batchSize: '1', stockQuantity: '0', lowStockThreshold: '10' 
    },
  });

  const values = watch(['sellingPrice', 'paper', 'printing', 'binding', 'other', 'batchSize']);
  const [sp, paper, printing, binding, other, batch] = values.map((v) => parseFloat(v) || 0);
  
  // Per Piece Calculation
  const unitCost = batch > 0 ? (paper + printing + binding + other) / batch : 0;
  const margin = sp > 0 ? ((sp - unitCost) / sp * 100) : 0;
  
  const marginColor = margin >= 25 ? '#4ADE80' : margin >= 15 ? Colors.primary : Colors.error;

  const onSubmit = async (data) => {
    try {
      const b = parseFloat(data.batchSize) || 1;
      await createProduct({
        name: data.name,
        sku: data.sku.toUpperCase(),
        sellingPrice: +data.sellingPrice,
        // Save PER PIECE costs to DB
        costBreakdown: { 
          paper: (+data.paper / b), 
          printing: (+data.printing / b), 
          binding: (+data.binding / b), 
          other: (+data.other / b) 
        },
        stockQuantity: +data.stockQuantity,
        lowStockThreshold: +data.lowStockThreshold,
      });
      showMessage({ message: 'NEW PRODUCT REGISTERED', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'CREATION FAILED', type: 'danger' });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="ADD TO INVENTORY" showBack />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.sectionHeader}>
            <PackagePlus size={20} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>GENERAL DETAILS</Text>
          </View>

          <View style={styles.card}>
            <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="PRODUCT NAME" value={value} onChangeText={onChange} error={errors.name?.message} placeholder="E.G. A4 RULED NOTEBOOK" autoCapitalize="characters" />
            )} />
            <Controller name="sku" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="SKU CODE (UNIQUE ID)" value={value} onChangeText={onChange} error={errors.sku?.message} placeholder="E.G. NB-A4-01" autoCapitalize="characters" />
            )} />
            <Controller name="sellingPrice" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="SELLING PRICE (PER PIECE)" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" error={errors.sellingPrice?.message} placeholder="0.00" />
            )} />
          </View>

          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>PER PIECE ANALYSIS</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.batchHelper}>
               <View style={styles.flex}>
                 <Controller name="batchSize" control={control} render={({ field: { onChange, value } }) => (
                   <AppInput label="BATCH QUANTITY" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="1" error={errors.batchSize?.message} />
                 )} />
               </View>
               <View style={styles.helperInfo}>
                  <Text style={styles.helperText}>ENTER TOTAL PRODUCTION COSTS FOR THIS BATCH QUANTITY TO CALCULATE UNIT MARGIN.</Text>
               </View>
            </View>

            <View style={styles.costRow}>
               <View style={styles.flex}>
                  <Controller name="paper" control={control} render={({ field: { onChange, value } }) => (
                    <AppInput label="PAPER COST" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" placeholder="0" />
                  )} />
               </View>
               <View style={styles.flex}>
                  <Controller name="printing" control={control} render={({ field: { onChange, value } }) => (
                    <AppInput label="PRINT COST" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" placeholder="0" />
                  )} />
               </View>
            </View>
            <View style={styles.costRow}>
               <View style={styles.flex}>
                  <Controller name="binding" control={control} render={({ field: { onChange, value } }) => (
                    <AppInput label="BINDING" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" placeholder="0" />
                  )} />
               </View>
               <View style={styles.flex}>
                  <Controller name="other" control={control} render={({ field: { onChange, value } }) => (
                    <AppInput label="MISC COST" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" placeholder="0" />
                  )} />
               </View>
            </View>

            <View style={[styles.marginBanner, margin < 10 && { borderColor: Colors.error }]}>
               <View style={styles.marginStack}>
                  <Text style={styles.mlabel}>UNIT COST (PER PIECE)</Text>
                  <Text style={styles.mvalue}>₹{unitCost.toFixed(2)}</Text>
               </View>
               <View style={[styles.marginStack, { alignItems: 'flex-end' }]}>
                  <Text style={styles.mlabel}>NET MARGIN (%)</Text>
                  <Text style={[styles.mvalue, { color: marginColor }]}>{margin.toFixed(1)}%</Text>
               </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Info size={20} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.sectionHeading}>STOCK CONTROL</Text>
          </View>

          <View style={styles.card}>
            <Controller name="stockQuantity" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="OPENING STOCK" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="0" />
            )} />
            <Controller name="lowStockThreshold" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="LOW STOCK ALERT LIMIT" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="10" />
            )} />
          </View>

          <View style={styles.footer}>
            <AppButton 
              title="REGISTER NEW PRODUCT" 
              onPress={handleSubmit(onSubmit)} 
              loading={isSubmitting} 
              fullWidth 
              style={styles.submitBtn} 
            />
            <AppButton 
              title="DISCARD & GO BACK" 
              onPress={() => router.back()} 
              variant="ghost" 
              fullWidth 
            />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 12 },
  sectionHeading: { fontSize: 11, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1.5 },
  card: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  batchHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  helperInfo: { flex: 1 },
  helperText: { fontSize: 8, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5, lineHeight: 12 },
  costRow: { flexDirection: 'row', gap: 16 },
  marginBanner: {
    marginTop: 20,
    backgroundColor: Colors.black,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  marginStack: { gap: 4 },
  mlabel: { fontSize: 8, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  mvalue: { fontSize: 18, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  footer: { marginTop: 12 },
  submitBtn: { marginBottom: 16 },
});
