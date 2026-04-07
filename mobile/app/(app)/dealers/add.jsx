import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Phone, Briefcase, BadgeCheck, Contact2 } from 'lucide-react-native';
import { showMessage } from 'react-native-flash-message';
import * as Contacts from 'expo-contacts';
import useDealerStore from '../../../src/store/useDealerStore';
import AppHeader from '../../../src/components/common/AppHeader';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';

const schema = z.object({
  name: z.string().min(1, 'CUSTOMER NAME IS REQUIRED'),
  phone: z.string().regex(/^\d{10}$/, 'VALID 10-DIGIT MOBILE REQUIRED'),
  shopName: z.string().min(1, 'SHOP NAME IS REQUIRED'),
  creditLimit: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'INVALID LIMIT'),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
});

export default function AddDealerScreen() {
  const { createDealer } = useDealerStore();
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', shopName: '', creditLimit: '0', address: '', gstNumber: '' },
  });

  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const contact = await Contacts.presentContactPickerAsync();
      if (contact) {
        // Clean phone number (remove spaces, dashes, +91)
        const rawPhone = contact.phoneNumbers?.[0]?.number || '';
        const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
        
        setValue('name', contact.name.toUpperCase());
        setValue('phone', cleanPhone);
        if (contact.company) setValue('shopName', contact.company.toUpperCase());
        
        showMessage({ message: 'CONTACT LOADED: ' + contact.name, type: 'info' });
      }
    } else {
      showMessage({ message: 'PERMISSION DENIED: CANNOT ACCESS CONTACTS', type: 'danger' });
    }
  };

  const onSubmit = async (data) => {
    try {
      await createDealer({ ...data, creditLimit: Number(data.creditLimit) });
      showMessage({ message: 'CUSTOMER ACCOUNT CREATED', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'CREATION FAILED', type: 'danger' });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="REGISTER CUSTOMER" showBack />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Quick Action: Pick Contact */}
          <TouchableOpacity style={styles.contactPickerBtn} onPress={pickContact} activeOpacity={0.8}>
             <Contact2 size={24} color={Colors.black} strokeWidth={2.5} />
             <Text style={styles.contactPickerText}>PICK FROM PHONE CONTACTS</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}><Phone size={14} color={Colors.primary} strokeWidth={2.5} /></View>
            <Text style={styles.sectionHeading}>PRIMARY CONTACT</Text>
          </View>

          <View style={styles.card}>
            <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="CUSTOMER / OWNER NAME" value={value} onChangeText={onChange} error={errors.name?.message} placeholder="E.G. RAMESH KUMAR" autoCapitalize="characters" />
            )} />
            <Controller name="phone" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="MOBILE NUMBER" value={value} onChangeText={onChange} error={errors.phone?.message} placeholder="10-DIGIT NUMBER" keyboardType="numeric" maxLength={10} prefix="+91" />
            )} />
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}><Briefcase size={14} color={Colors.primary} strokeWidth={2.5} /></View>
            <Text style={styles.sectionHeading}>BUSINESS DETAILS</Text>
          </View>

          <View style={styles.card}>
            <Controller name="shopName" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="SHOP / BUSINESS NAME" value={value} onChangeText={onChange} error={errors.shopName?.message} placeholder="E.G. KUMAR STATIONERY" autoCapitalize="characters" />
            )} />
            <Controller name="gstNumber" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="GSTIN (FOR TAX BILLS)" value={value} onChangeText={onChange} placeholder="E.G. 27ABCDE1234F1ZM" autoCapitalize="characters" />
            )} />
            <Controller name="address" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="OFFICE / SHOP ADDRESS" value={value} onChangeText={onChange} placeholder="LOCALITY, CITY, PIN" multiline numberOfLines={2} autoCapitalize="characters" />
            )} />
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}><BadgeCheck size={14} color={Colors.primary} strokeWidth={2.5} /></View>
            <Text style={styles.sectionHeading}>TRUST & CREDIT</Text>
          </View>

          <View style={styles.card}>
            <Controller name="creditLimit" control={control} render={({ field: { onChange, value } }) => (
              <AppInput label="ALLOWED CREDIT LIMIT" value={value} onChangeText={onChange} error={errors.creditLimit?.message} prefix="₹" placeholder="0" keyboardType="numeric" />
            )} />
          </View>

          <View style={styles.footer}>
            <AppButton
              title="FINALIZE & REGISTER"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              fullWidth
              style={styles.submitBtn}
            />
            <AppButton 
              title="CANCEL" 
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
  root: { flex: 1, backgroundColor: Colors.black },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  contactPickerBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: Colors.white, 
    padding: 18, 
    borderRadius: 20, 
    gap: 12, 
    marginBottom: 32,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  contactPickerText: { fontSize: 13, fontWeight: '900', color: Colors.black, letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 12 },
  iconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255, 107, 0, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)' },
  sectionHeading: { fontSize: 11, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1.5 },
  card: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  footer: { marginTop: 12 },
  submitBtn: { marginBottom: 16 },
});
