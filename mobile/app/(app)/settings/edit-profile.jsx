import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { User, Briefcase, FileText, MapPin, CreditCard } from 'lucide-react-native';
import AppHeader from '../../../src/components/common/AppHeader';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';
import useAuthStore from '../../../src/store/useAuthStore';

const schema = z.object({
  name: z.string().min(1, 'OWNER NAME IS REQUIRED'),
  shopName: z.string().optional(),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  upiVpa: z.string().optional(),
  upiName: z.string().optional(),
});

export default function EditProfileScreen() {
  const { user, updateProfile, isLoading: isStoreLoading } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      shopName: user?.shopName || '',
      gstNumber: user?.gstNumber || '',
      address: user?.address || '',
      upiVpa: user?.upiVpa || '',
      upiName: user?.upiName || '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateProfile(data);
      showMessage({ message: 'PROFILE UPDATED SUCCESSFULLY', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="EDIT PROFILE" subtitle="MANAGE STORE DETAILS" showBack />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OWNER & STORE</Text>
            <View style={styles.card}>
              <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
                <AppInput label="OWNER NAME" icon={<User size={14} color={Colors.textMuted} />} value={value} onChangeText={onChange} placeholder="Full Name" />
              )} />
              <Controller name="shopName" control={control} render={({ field: { onChange, value } }) => (
                <AppInput label="SHOP / BUSINESS NAME" icon={<Briefcase size={14} color={Colors.textMuted} />} value={value} onChangeText={onChange} placeholder="Store Name" />
              )} />
              <Controller name="gstNumber" control={control} render={({ field: { onChange, value } }) => (
                <AppInput label="GST NUMBER (OPTIONAL)" icon={<FileText size={14} color={Colors.textMuted} />} value={value} onChangeText={onChange} placeholder="GSTIN" autoCapitalize="characters" />
              )} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LOCATION & CONTACT</Text>
            <View style={styles.card}>
              <Controller name="address" control={control} render={({ field: { onChange, value } }) => (
                <AppInput label="BUSINESS ADDRESS" icon={<MapPin size={14} color={Colors.textMuted} />} value={value} onChangeText={onChange} placeholder="Full Address" multiline numberOfLines={3} />
              )} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PAYMENT SETTINGS (UPI)</Text>
            <View style={styles.card}>
              <Controller name="upiVpa" control={control} render={({ field: { onChange, value } }) => (
                <AppInput label="UPI ID / VPA" icon={<CreditCard size={14} color={Colors.textMuted} />} value={value} onChangeText={onChange} placeholder="example@upi" autoCapitalize="none" />
              )} />
              <Controller name="upiName" control={control} render={({ field: { onChange, value } }) => (
                <AppInput label="UPI REGISTERED NAME" icon={<User size={14} color={Colors.textMuted} />} value={value} onChangeText={onChange} placeholder="Payee Name" />
              )} />
            </View>
          </View>

          <AppButton 
            title="SAVE BUSINESS IDENTITY" 
            onPress={handleSubmit(onSubmit)} 
            loading={loading || isStoreLoading} 
            style={styles.saveBtn}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: Colors.textMuted, letterSpacing: 2, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: Colors.surface, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  saveBtn: { marginTop: 8 }
});
