import React from 'react';
import { ScrollView, View, Text, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useProductStore from '../../../src/store/useProductStore';
import AppHeader from '../../../src/components/common/AppHeader';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';
import { Spacing } from '../../../src/theme/spacing';

const schema = z.object({
  name: z.string().min(1, 'NAME REQUIRED'),
  sku: z.string().min(1, 'SKU REQUIRED'),
  sellingPrice: z.string().refine((v) => !isNaN(+v) && +v > 0, 'VALID PRICE REQUIRED'),
  paper: z.string().default('0'),
  printing: z.string().default('0'),
  binding: z.string().default('0'),
  other: z.string().default('0'),
  stockQuantity: z.string().default('0'),
  lowStockThreshold: z.string().default('10'),
});

export default function AddProductScreen() {
  const { createProduct } = useProductStore();
  const { control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', sku: '', sellingPrice: '', paper: '0', printing: '0', binding: '0', other: '0', stockQuantity: '0', lowStockThreshold: '10' },
  });

  const values = watch(['sellingPrice', 'paper', 'printing', 'binding', 'other']);
  const [sp, paper, printing, binding, other] = values.map((v) => parseFloat(v) || 0);
  const mfgCost = paper + printing + binding + other;
  const margin = sp > 0 ? ((sp - mfgCost) / sp * 100) : 0;
  
  // Industrial Color Logic
  const marginColor = margin >= 25 ? '#4ADE80' : margin >= 15 ? Colors.primary : Colors.error;

  const onSubmit = async (data) => {
    try {
      await createProduct({
        name: data.name,
        sku: data.sku.toUpperCase(),
        sellingPrice: +data.sellingPrice,
        costBreakdown: { paper: +data.paper, printing: +data.printing, binding: +data.binding, other: +data.other },
        stockQuantity: +data.stockQuantity,
        lowStockThreshold: +data.lowStockThreshold,
      });
      showMessage({ message: 'SKU CREATED SUCCESSFULLY', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'CREATION FAILED', type: 'danger' });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="NEW SKU" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.section}>
            <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="PRODUCT NAME" value={value} onChangeText={onChange} error={errors.name?.message} placeholder="E.G. A4 RULED NOTEBOOK" autoCapitalize="characters" />
            )} />
            <Controller name="sku" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="STOCK UNIT (SKU)" value={value} onChangeText={onChange} error={errors.sku?.message} placeholder="E.G. NB-A4-01" autoCapitalize="characters" />
            )} />
            <Controller name="sellingPrice" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="BASE SELLING PRICE" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" error={errors.sellingPrice?.message} placeholder="0.00" />
            )} />
          </View>

          {/* Cost Logic Section */}
          <Text style={styles.sectionLabel}>MANUFACTURING BREAKDOWN</Text>
          <View style={styles.section}>
            {[['paper', 'PAPER'], ['printing', 'PRINTING'], ['binding', 'BINDING'], ['other', 'MISC']].map(([name, label]) => (
              <Controller key={name} name={name} control={control} render={({ field: { onChange, value } }) => (
                <AppInput label={label} value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" placeholder="0" />
              )} />
            ))}
          </View>

          {/* Industrial Margin Readout */}
          <View style={styles.readoutCard}>
            <View style={styles.readoutRow}>
               <Text style={styles.readoutLabel}>TOTAL MFG COST</Text>
               <Text style={styles.readoutVal}>₹{mfgCost.toFixed(2)}</Text>
            </View>
            <View style={styles.readoutRow}>
               <Text style={styles.readoutLabel}>PROJECTED MARGIN</Text>
               <Text style={[styles.readoutVal, { color: marginColor }]}>{margin.toFixed(1)}%</Text>
            </View>
          </View>

          {/* Stock Section */}
          <Text style={styles.sectionLabel}>INVENTORY CONTROL</Text>
          <View style={styles.section}>
            <Controller name="stockQuantity" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="INITIAL STOCK" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="0" />
            )} />
            <Controller name="lowStockThreshold" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="LOW STOCK ALERT AT" value={value} onChangeText={onChange} keyboardType="numeric" placeholder="10" />
            )} />
          </View>

          <View style={styles.footer}>
            <AppButton 
              title="CREATE SKU" 
              onPress={handleSubmit(onSubmit)} 
              loading={isSubmitting} 
              fullWidth 
              style={styles.submitBtn} 
            />
            <AppButton 
              title="DISCARD" 
              onPress={() => router.back()} 
              variant="ghost" 
              fullWidth 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: 60 },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: Colors.textMuted, letterSpacing: 2, marginBottom: 16, marginTop: 16 },
  section: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  readoutCard: {
    backgroundColor: Colors.black,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 24,
    marginTop: 16,
  },
  readoutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  readoutLabel: { fontSize: 10, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1.5 },
  readoutVal: { fontSize: 18, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  footer: { marginTop: 12 },
  submitBtn: { marginBottom: 12 },
});
