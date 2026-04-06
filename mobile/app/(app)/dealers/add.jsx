import React from 'react';
import { View, ScrollView, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useDealerStore from '../../../src/store/useDealerStore';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing } from '../../../src/theme/spacing';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  shopName: z.string().min(1, 'Shop name is required'),
  creditLimit: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid amount'),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

export default function AddDealerScreen() {
  const { createDealer } = useDealerStore();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', shopName: '', creditLimit: '0', address: '', gstNumber: '' },
  });

  const onSubmit = async (data) => {
    try {
      await createDealer({ ...data, creditLimit: Number(data.creditLimit) });
      showMessage({ message: 'Dealer added successfully!', type: 'success', icon: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'Failed to add dealer', type: 'danger', icon: 'danger' });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add Dealer</Text>

          <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Dealer Name *" value={value} onChangeText={onChange} error={errors.name?.message} placeholder="e.g. Ramesh Kumar" />
          )} />
          <Controller name="phone" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Phone Number *" value={value} onChangeText={onChange} error={errors.phone?.message} placeholder="10-digit mobile number" keyboardType="numeric" maxLength={10} />
          )} />
          <Controller name="shopName" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Shop Name *" value={value} onChangeText={onChange} error={errors.shopName?.message} placeholder="e.g. Kumar Stationery" />
          )} />
          <Controller name="creditLimit" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Credit Limit *" value={value} onChangeText={onChange} error={errors.creditLimit?.message} prefix="₹" placeholder="0" keyboardType="numeric" />
          )} />
          <Controller name="address" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Address (optional)" value={value} onChangeText={onChange} placeholder="Shop address" multiline numberOfLines={2} />
          )} />
          <Controller name="gstNumber" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="GST Number (optional)" value={value} onChangeText={onChange} placeholder="e.g. 27ABCDE1234F1Z5" autoCapitalize="characters" />
          )} />

          <AppButton
            title="Add Dealer"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            fullWidth
            style={styles.submitBtn}
          />
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
  submitBtn: { marginBottom: Spacing.sm, marginTop: Spacing.md },
});
