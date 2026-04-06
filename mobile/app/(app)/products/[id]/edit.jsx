import React, { useEffect } from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showMessage } from 'react-native-flash-message';
import useProductStore from '../../../../src/store/useProductStore';
import AppInput from '../../../../src/components/common/AppInput';
import AppButton from '../../../../src/components/common/AppButton';
import AppLoader from '../../../../src/components/common/AppLoader';
import { Colors } from '../../../../src/theme/colors';
import { Typography } from '../../../../src/theme/typography';
import { Spacing } from '../../../../src/theme/spacing';

const schema = z.object({
  name: z.string().min(1),
  sellingPrice: z.string().refine((v) => !isNaN(+v) && +v >= 0),
  paper: z.string().default('0'),
  printing: z.string().default('0'),
  binding: z.string().default('0'),
  other: z.string().default('0'),
  stockQuantity: z.string().default('0'),
  lowStockThreshold: z.string().default('10'),
});

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const { currentProduct, fetchProduct, updateProduct, isLoading } = useProductStore();

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => { fetchProduct(id); }, [id]);

  useEffect(() => {
    if (currentProduct) {
      reset({
        name: currentProduct.name,
        sellingPrice: String(currentProduct.sellingPrice),
        paper: String(currentProduct.costBreakdown?.paper || 0),
        printing: String(currentProduct.costBreakdown?.printing || 0),
        binding: String(currentProduct.costBreakdown?.binding || 0),
        other: String(currentProduct.costBreakdown?.other || 0),
        stockQuantity: String(currentProduct.stockQuantity || 0),
        lowStockThreshold: String(currentProduct.lowStockThreshold || 10),
      });
    }
  }, [currentProduct]);

  const onSubmit = async (data) => {
    try {
      await updateProduct(id, {
        name: data.name,
        sellingPrice: +data.sellingPrice,
        costBreakdown: { paper: +data.paper, printing: +data.printing, binding: +data.binding, other: +data.other },
        stockQuantity: +data.stockQuantity,
        lowStockThreshold: +data.lowStockThreshold,
      });
      showMessage({ message: 'Product updated!', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'Update failed', type: 'danger' });
    }
  };

  if (isLoading && !currentProduct) return <AppLoader fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Product</Text>
          {[
            ['name', 'Product Name *', {}, {}],
            ['sellingPrice', 'Selling Price *', { keyboardType: 'numeric' }, { prefix: '₹' }],
          ].map(([name, label, inputProps, extra]) => (
            <Controller key={name} name={name} control={control} render={({ field: { onChange, value } }) => (
              <AppInput label={label} value={value} onChangeText={onChange} {...inputProps} {...extra} />
            )} />
          ))}
          <Text style={styles.section}>Cost Breakdown</Text>
          {[['paper', 'Paper Cost'], ['printing', 'Printing Cost'], ['binding', 'Binding Cost'], ['other', 'Other Cost']].map(([name, label]) => (
            <Controller key={name} name={name} control={control} render={({ field: { onChange, value } }) => (
              <AppInput label={label} value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" />
            )} />
          ))}
          <Controller name="stockQuantity" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Stock Quantity" value={value} onChangeText={onChange} keyboardType="numeric" />
          )} />
          <Controller name="lowStockThreshold" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Low Stock Threshold" value={value} onChangeText={onChange} keyboardType="numeric" />
          )} />
          <AppButton title="Save Changes" onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth style={styles.btn} />
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
  section: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginVertical: Spacing.sm },
  btn: { marginTop: Spacing.md, marginBottom: Spacing.sm },
});
