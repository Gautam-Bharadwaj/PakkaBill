import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useDealerStore from '../../../src/store/useDealerStore';
import AppHeader from '../../../src/components/common/AppHeader';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';
import { Spacing } from '../../../src/theme/spacing';

const schema = z.object({
  name: z.string().min(1, 'NAME IS REQUIRED'),
  phone: z.string().regex(/^\d{10}$/, 'ENTER VALID 10-DIGIT MOBILE'),
  shopName: z.string().min(1, 'SHOP NAME IS REQUIRED'),
  creditLimit: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'ENTER VALID AMOUNT'),
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
      showMessage({ message: 'ACCOUNT CREATED SUCCESSFULLY', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'CREATION FAILED', type: 'danger' });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="NEW ACCOUNT" showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="CUSTOMER NAME" value={value} onChangeText={onChange} error={errors.name?.message} placeholder="E.G. RAMESH KUMAR" autoCapitalize="characters" />
            )} />
            <Controller name="phone" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="MOBILE NUMBER" value={value} onChangeText={onChange} error={errors.phone?.message} placeholder="10-DIGIT NUMBER" keyboardType="numeric" maxLength={10} />
            )} />
            <Controller name="shopName" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="SHOP / BUSINESS NAME" value={value} onChangeText={onChange} error={errors.shopName?.message} placeholder="E.G. KUMAR STATIONERY" autoCapitalize="characters" />
            )} />
            <Controller name="creditLimit" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="CREDIT LIMIT" value={value} onChangeText={onChange} error={errors.creditLimit?.message} prefix="₹" placeholder="0" keyboardType="numeric" />
            )} />
            <Controller name="gstNumber" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="GSTIN (OPTIONAL)" value={value} onChangeText={onChange} placeholder="E.G. 27ABCDE1234F1Z5" autoCapitalize="characters" />
            )} />
            <Controller name="address" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="BUSINESS ADDRESS" value={value} onChangeText={onChange} placeholder="LOCALITY, CITY" multiline numberOfLines={2} autoCapitalize="characters" />
            )} />
          </View>

          <View style={styles.footer}>
            <AppButton
              title="CREATE ACCOUNT"
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
  content: { padding: Spacing.base, paddingBottom: 40 },
  formSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  footer: { marginTop: 8 },
  submitBtn: { marginBottom: 12 },
});
