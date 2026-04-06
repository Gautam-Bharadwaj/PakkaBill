import React, { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showMessage } from 'react-native-flash-message';
import useDealerStore from '../../../../src/store/useDealerStore';
import AppInput from '../../../../src/components/common/AppInput';
import AppButton from '../../../../src/components/common/AppButton';
import AppLoader from '../../../../src/components/common/AppLoader';
import { Colors } from '../../../../src/theme/colors';
import { Typography } from '../../../../src/theme/typography';
import { Spacing } from '../../../../src/theme/spacing';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  shopName: z.string().min(1, 'Shop name required'),
  creditLimit: z.string().refine((v) => !isNaN(Number(v)), 'Enter a valid amount'),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

export default function EditDealerScreen() {
  const { id } = useLocalSearchParams();
  const { currentDealer, fetchDealer, updateDealer, isLoading } = useDealerStore();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetchDealer(id);
  }, [id]);

  useEffect(() => {
    if (currentDealer) {
      reset({
        name: currentDealer.name,
        shopName: currentDealer.shopName,
        creditLimit: String(currentDealer.creditLimit),
        address: currentDealer.address || '',
        gstNumber: currentDealer.gstNumber || '',
      });
    }
  }, [currentDealer]);

  const onSubmit = async (data) => {
    try {
      await updateDealer(id, { ...data, creditLimit: Number(data.creditLimit) });
      showMessage({ message: 'Dealer updated!', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'Update failed', type: 'danger' });
    }
  };

  if (isLoading && !currentDealer) return <AppLoader fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Edit Dealer</Text>

          {/* Phone is read-only */}
          <View style={styles.readOnly}>
            <Text style={styles.readOnlyLabel}>Phone Number (cannot be changed)</Text>
            <Text style={styles.readOnlyValue}>{currentDealer?.phone}</Text>
          </View>

          <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Dealer Name *" value={value} onChangeText={onChange} error={errors.name?.message} />
          )} />
          <Controller name="shopName" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Shop Name *" value={value} onChangeText={onChange} error={errors.shopName?.message} />
          )} />
          <Controller name="creditLimit" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Credit Limit *" value={value} onChangeText={onChange} prefix="₹" keyboardType="numeric" error={errors.creditLimit?.message} />
          )} />
          <Controller name="address" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="Address" value={value} onChangeText={onChange} multiline numberOfLines={2} />
          )} />
          <Controller name="gstNumber" control={control} render={({ field: { onChange, value } }) => (
            <AppInput label="GST Number" value={value} onChangeText={onChange} autoCapitalize="characters" />
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
  readOnly: { backgroundColor: Colors.surface, borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md },
  readOnlyLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  readOnlyValue: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  btn: { marginBottom: Spacing.sm, marginTop: Spacing.md },
});
