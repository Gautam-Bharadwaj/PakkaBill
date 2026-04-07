import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { ShieldCheck, Lock } from 'lucide-react-native';
import AppHeader from '../../../src/components/common/AppHeader';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';
import client from '../../../src/api/client';

const schema = z.object({
  currentPin: z.string().length(6, 'CURRENT PIN MUST BE 6 DIGITS'),
  newPin: z.string().length(6, 'NEW PIN MUST BE 6 DIGITS'),
  confirmPin: z.string().length(6, 'CONFIRM PIN MUST BE 6 DIGITS'),
}).refine((data) => data.newPin === data.confirmPin, {
  message: "NEW PINS DO NOT MATCH",
  path: ["confirmPin"],
});

export default function ChangePinScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPin: '', newPin: '', confirmPin: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Direct API call to update PIN
      await client.patch('/auth/change-pin', { 
        currentPin: data.currentPin, 
        newPin: data.newPin 
      });
      showMessage({ message: 'SECURITY PIN UPDATED SUCCESSFULLY', type: 'success' });
      router.back();
    } catch (err) {
      showMessage({ 
        message: err.response?.data?.message || 'PIN UPDATE FAILED', 
        type: 'danger' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="SECURITY CONSOLE" subtitle="CHANGE ACCESS PIN" showBack />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Lock size={20} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.infoText}>ALWAYS USE A PIN THAT YOU CAN REMEMBER BUT IS HARD TO GUESS.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
               <Controller name="currentPin" control={control} render={({ field: { onChange, value } }) => (
                 <AppInput 
                    label="ENTER CURRENT PIN" 
                    value={value} 
                    onChangeText={onChange} 
                    error={errors.currentPin?.message} 
                    placeholder="000000" 
                    keyboardType="numeric" 
                    maxLength={6} 
                    isPassword 
                 />
               )} />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
               <Controller name="newPin" control={control} render={({ field: { onChange, value } }) => (
                 <AppInput 
                    label="CREATE NEW 6-DIGIT PIN" 
                    value={value} 
                    onChangeText={onChange} 
                    error={errors.newPin?.message} 
                    placeholder="NEW PIN" 
                    keyboardType="numeric" 
                    maxLength={6} 
                    isPassword 
                 />
               )} />
            </View>

            <View style={styles.inputGroup}>
               <Controller name="confirmPin" control={control} render={({ field: { onChange, value } }) => (
                 <AppInput 
                    label="RE-TYPE NEW PIN" 
                    value={value} 
                    onChangeText={onChange} 
                    error={errors.confirmPin?.message} 
                    placeholder="MATCH NEW PIN" 
                    keyboardType="numeric" 
                    maxLength={6} 
                    isPassword 
                 />
               )} />
            </View>
          </View>

          <View style={styles.footer}>
             <AppButton title="UPDATE SECURITY PIN" onPress={handleSubmit(onSubmit)} loading={isLoading} fullWidth />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: 24 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255, 107, 0, 0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)', marginBottom: 24 },
  infoText: { flex: 1, fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  formCard: { backgroundColor: Colors.surface, padding: 24, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.border },
  inputGroup: { marginBottom: 12 },
  divider: { height: 1.5, backgroundColor: Colors.border, marginVertical: 12, opacity: 0.5 },
  footer: { marginTop: 32 },
});
