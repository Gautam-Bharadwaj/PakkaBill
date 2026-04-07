import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar, 
  Dimensions, 
  Image, 
  ScrollView 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { Zap, ArrowRight, UserCircle2, ShieldCheck, Undo2 } from 'lucide-react-native';
import useAuthStore from '../../src/store/useAuthStore';
import AppHeader from '../../src/components/common/AppHeader';
import AppInput from '../../src/components/common/AppInput';
import AppButton from '../../src/components/common/AppButton';
import { Colors } from '../../src/theme/colors';

const schema = z.object({
  name: z.string().min(3, 'OWNER NAME MUST BE AT LEAST 3 CHARS'),
  pin: z.string().length(6, 'PIN MUST BE EXACTLY 6 DIGITS'),
  confirmPin: z.string().length(6, 'CONFIRM PIN MUST BE 6 DIGITS'),
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINS DO NOT MATCH",
  path: ["confirmPin"],
});

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup, isLoading } = useAuthStore();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', pin: '', confirmPin: '' }
  });

  const onSubmit = async (data) => {
    try {
      await signup({ name: data.name, pin: data.pin });
      showMessage({ message: 'BUSINESS ACCOUNT CREATED', type: 'success' });
      router.replace('/(app)/dashboard');
    } catch (err) {
      showMessage({ message: err.message || 'SIGNUP FAILED', type: 'danger' });
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.flex} 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Unified Header Inside ScrollView */}
          <View style={styles.header}>
            <View style={styles.logoFrame}>
               <Image 
                 source={require('../../assets/pakkabill_logo.png')} 
                 style={{ width: 44, height: 44 }} 
                 resizeMode="contain" 
               />
            </View>
            <Text style={styles.title}>START YOUR BUSINESS</Text>
            <Text style={styles.subtitle}>CREATE YOUR SECURE BILLING IDENTITY</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
               <View style={styles.inputHeader}>
                  <UserCircle2 size={16} color={Colors.primary} strokeWidth={2.5} />
                  <Text style={styles.inputLabel}>FULL NAME / OWNER NAME</Text>
               </View>
               <Controller name="name" control={control} render={({ field: { onChange, value } }) => (
                 <AppInput value={value} onChangeText={onChange} error={errors.name?.message} placeholder="E.G. RAJESH KHANNA" autoCapitalize="characters" />
               )} />
            </View>

            <View style={styles.inputGroup}>
               <View style={styles.inputHeader}>
                  <ShieldCheck size={16} color={Colors.primary} strokeWidth={2.5} />
                  <Text style={styles.inputLabel}>CREATE 6-DIGIT SECURITY PIN</Text>
               </View>
               <Controller name="pin" control={control} render={({ field: { onChange, value } }) => (
                 <AppInput 
                   value={value} 
                   onChangeText={onChange} 
                   error={errors.pin?.message} 
                   placeholder="000000" 
                   keyboardType="numeric" 
                   maxLength={6} 
                   isPassword={true} 
                 />
               )} />
            </View>

            <View style={styles.inputGroup}>
               <View style={styles.inputHeader}>
                  <ShieldCheck size={16} color={Colors.primary} strokeWidth={2.5} />
                  <Text style={styles.inputLabel}>CONFIRM SECURITY PIN</Text>
               </View>
               <Controller name="confirmPin" control={control} render={({ field: { onChange, value } }) => (
                 <AppInput 
                   value={value} 
                   onChangeText={onChange} 
                   error={errors.confirmPin?.message} 
                   placeholder="REPEAT PIN" 
                   keyboardType="numeric" 
                   maxLength={6} 
                   isPassword={true} 
                 />
               )} />
            </View>

            <View style={styles.termsRow}>
               <Text style={styles.termsText}>BY SIGNING UP, YOU AGREE TO OUR BUSINESS PRIVACY POLICIES.</Text>
            </View>
          </View>

          <View style={styles.footer}>
             <AppButton title="CREATE ACCOUNT" onPress={handleSubmit(onSubmit)} loading={isLoading} fullWidth style={styles.mainBtn} />
             
             <TouchableOpacity style={styles.backToLogin} onPress={() => router.push('/(auth)/login')}>
                <Undo2 size={18} color={Colors.textSecondary} strokeWidth={2.5} />
                <Text style={styles.backText}>ALREADY HAVE AN ACCOUNT? <Text style={styles.linkText}>LOGIN</Text></Text>
             </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: { alignItems: 'center', paddingBottom: 30 },
  logoFrame: { 
    width: 70, 
    height: 70, 
    backgroundColor: Colors.card, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1.5, 
    borderColor: Colors.border, 
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  title: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: Colors.white, 
    letterSpacing: 1,
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 10, 
    color: Colors.textSecondary, 
    fontWeight: '700', 
    letterSpacing: 2, 
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8
  },
  content: { padding: 20, paddingBottom: 40 },
  formCard: { 
    backgroundColor: Colors.surface, 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: Colors.border,
  },
  inputGroup: { marginBottom: 20 },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1 },
  termsRow: { marginTop: 10, opacity: 0.5 },
  termsText: { fontSize: 8, color: Colors.textMuted, textAlign: 'center', letterSpacing: 0.5 },
  footer: { marginTop: 40, paddingHorizontal: 4 },
  mainBtn: { marginBottom: 24 },
  backToLogin: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10,
    paddingVertical: 10 
  },
  backText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
  linkText: { color: Colors.primary, fontWeight: '900' },
});
