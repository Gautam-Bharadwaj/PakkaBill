import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useProductStore from '../../../src/store/useProductStore';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';
import { MARGIN_THRESHOLDS } from '../../../src/constants/app';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  sellingPrice: z.string().refine((v) => !isNaN(+v) && +v > 0, 'Valid price required'),
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
    defaultValues: { name: '', sellingPrice: '', paper: '0', printing: '0', binding: '0', other: '0', stockQuantity: '0', lowStockThreshold: '10' },
  });

  const values = watch(['sellingPrice', 'paper', 'printing', 'binding', 'other']);
  const [sp, paper, printing, binding, other] = values.map((v) => parseFloat(v) || 0);
  const mfgCost = paper + printing + binding + other;
  const margin = sp > 0 ? ((sp - mfgCost) / sp * 100) : 0;
  const marginColor = margin >= MARGIN_THRESHOLDS.MEDIUM ? Colors.success : margin >= MARGIN_THRESHOLDS.LOW ? Colors.warning : Colors.danger;

  const onSubmit = async (data) => {
    try {
      await createProduct({
        name: data.name,
        sellingPrice: +data.sellingPrice,
        costBreakdown: { paper: +data.paper, printing: +data.printing, binding: +data.binding, other: +data.other },
        stockQuantity: +data.stockQuantity,
        lowStockThreshold: +data.lowStockThreshold,
      });
      showMessage({ message: 'Product added!', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'Failed to add product', type: 'danger' });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add Product</Text>

          <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Product Name *" value={value} onChangeText={onChange} error={errors.name?.message} />
          )} />
          <Controller name="sellingPrice" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Selling Price *" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" error={errors.sellingPrice?.message} />
          )} />

          <Text style={styles.section}>Cost Breakdown</Text>
          {[['paper', 'Paper Cost'], ['printing', 'Printing Cost'], ['binding', 'Binding Cost'], ['other', 'Other Cost']].map(([name, label]) => (
            <Controller key={name} name={name} control={control} render={({ field: { onChange, value } }) => (
              <AppInput label={label} value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" />
            )} />
          ))}

          {/* Live preview */}
          <AppCard style={styles.preview}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Manufacturing Cost</Text>
              <Text style={styles.previewValue}>₹{mfgCost.toFixed(2)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Profit Margin</Text>
              <Text style={[styles.previewValue, { color: marginColor }]}>{margin.toFixed(1)}%</Text>
            </View>
            {margin < MARGIN_THRESHOLDS.LOW && (
              <Text style={styles.warning}>Low margin product — below {MARGIN_THRESHOLDS.LOW}% threshold</Text>
            )}
          </AppCard>

          <Controller name="stockQuantity" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Stock Quantity" value={value} onChangeText={onChange} keyboardType="numeric" />
          )} />
          <Controller name="lowStockThreshold" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Low Stock Threshold" value={value} onChangeText={onChange} keyboardType="numeric" />
          )} />

          <AppButton title="Add Product" onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth style={styles.btn} />
          <AppButton title="Cancel" onPress={() => router.back()} variant="ghost" fullWidth />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.text, marginBottom: Spacing.lg },
  section: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  preview: { marginBottom: Spacing.md, backgroundColor: Colors.primaryLighter },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  previewLabel: { fontSize: Typography.fontSize.md, color: Colors.textSecondary },
  previewValue: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  warning: { color: Colors.danger, fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, marginTop: Spacing.xs },
  btn: { marginTop: Spacing.md, marginBottom: Spacing.sm },
});
