import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, ScrollView,
  TextInput, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Phone, User, Store } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../src/store/useAuthStore';
import { Colors } from '../../src/theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Signup is a 3-step wizard ──
// Step 1: Enter phone number → request OTP
// Step 2: Enter OTP code
// Step 3: Enter name, shop name, PIN → create account

export default function SignupScreen() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const { requestOtp, resendOtp, signup } = useAuthStore();
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // ── Step 1: Request OTP ──
  const handleRequestOtp = async () => {
    if (!phone.trim() || phone.length !== 10) {
      showMessage({ message: 'Enter a valid 10-digit mobile number', type: 'warning' });
      return;
    }
    setLocalLoading(true);
    try {
      await requestOtp(phone.trim());
      showMessage({ message: 'OTP sent to your WhatsApp!', type: 'success' });
      setStep(2);
      setResendCooldown(30); // 30 sec cooldown
      const timer = setInterval(() => {
        setResendCooldown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
    } catch (err) {
      showMessage({ message: err.message || 'Could not send OTP', type: 'danger' });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLocalLoading(true);
    try {
      await resendOtp(phone.trim());
      showMessage({ message: 'OTP resent!', type: 'success' });
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
    } catch (err) {
      showMessage({ message: err.message || 'Could not resend OTP', type: 'danger' });
    } finally {
      setLocalLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = () => {
    if (!otp.trim() || otp.length !== 6) {
      showMessage({ message: 'Enter the 6-digit OTP from WhatsApp', type: 'warning' });
      return;
    }
    setStep(3);
  };

  // ── Step 3: Create Account ──
  const handleSignup = async () => {
    if (!name.trim()) {
      showMessage({ message: 'Owner name is required', type: 'warning' });
      return;
    }
    if (!pin.trim() || pin.length !== 6) {
      showMessage({ message: 'PIN must be exactly 6 digits', type: 'warning' });
      return;
    }
    if (pin !== confirmPin) {
      showMessage({ message: 'PINs do not match', type: 'danger' });
      return;
    }
    setLocalLoading(true);
    try {
      await signup({ name: name.trim(), pin, shopName: shopName.trim(), contactNo: phone, otpCode: otp });
      showMessage({ message: 'Account created! Welcome to PakkaBill 🎉', type: 'success' });
      router.replace('/(app)/dashboard');
    } catch (err) {
      showMessage({ message: err.message || 'Signup failed', type: 'danger' });
    } finally {
      setLocalLoading(false);
    }
  };

  const stepTitles = {
    1: { title: 'Create Account', sub: 'Step 1 of 3 — Enter your mobile number' },
    2: { title: 'Verify OTP', sub: `Step 2 of 3 — Enter OTP sent to +91${phone}` },
    3: { title: 'Setup Your Store', sub: 'Step 3 of 3 — Almost there!' },
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/pakkabill_logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.appName}>PAKKABILL</Text>
            {/* Progress Bar */}
            <View style={styles.progressBar}>
              {[1, 2, 3].map((s) => (
                <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
              ))}
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Back button */}
            {step > 1 && (
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
                <ArrowLeft size={18} color={Colors.textMuted} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.cardTitle}>{stepTitles[step].title}</Text>
            <Text style={styles.cardSub}>{stepTitles[step].sub}</Text>

            {/* ── STEP 1: Phone ── */}
            {step === 1 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>MOBILE NUMBER</Text>
                  <View style={styles.inputRow}>
                    <Text style={styles.phonePrefix}>+91</Text>
                    <View style={styles.phoneDivider} />
                    <Phone size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 10))}
                      placeholder="10-digit number"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={10}
                      returnKeyType="done"
                      onSubmitEditing={handleRequestOtp}
                    />
                  </View>
                  <Text style={styles.hint}>An OTP will be sent via WhatsApp</Text>
                </View>
                <TouchableOpacity style={[styles.btn, localLoading && { opacity: 0.75 }]} onPress={handleRequestOtp} disabled={localLoading} activeOpacity={0.85}>
                  {localLoading ? <ActivityIndicator color={Colors.white} /> : (
                    <>
                      <Text style={styles.btnText}>SEND OTP VIA WHATSAPP</Text>
                      <ArrowRight size={20} color={Colors.white} strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 2 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>6-DIGIT OTP</Text>
                  <View style={[styles.inputRow, { justifyContent: 'center' }]}>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      value={otp}
                      onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyOtp}
                    />
                  </View>
                  <View style={styles.resendRow}>
                    <Text style={styles.hint}>Didn't receive it? </Text>
                    <TouchableOpacity onPress={handleResendOtp} disabled={resendCooldown > 0}>
                      <Text style={[styles.resendLink, resendCooldown > 0 && { color: Colors.textMuted }]}>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp} activeOpacity={0.85}>
                  <Text style={styles.btnText}>VERIFY OTP</Text>
                  <ArrowRight size={20} color={Colors.white} strokeWidth={2.5} />
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 3: Details ── */}
            {step === 3 && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>YOUR NAME</Text>
                  <View style={styles.inputRow}>
                    <User size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Owner / Business name" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>SHOP NAME (OPTIONAL)</Text>
                  <View style={styles.inputRow}>
                    <Store size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput style={styles.input} value={shopName} onChangeText={setShopName} placeholder="e.g. Sharma & Sons" placeholderTextColor={Colors.textMuted} autoCapitalize="words" />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CREATE 6-DIGIT PIN</Text>
                  <View style={styles.inputRow}>
                    <Lock size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput style={[styles.input, { flex: 1 }]} value={pin} onChangeText={(v) => setPin(v.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="••••••" placeholderTextColor={Colors.textMuted} keyboardType="number-pad" secureTextEntry={!showPin} maxLength={6} />
                    <TouchableOpacity onPress={() => setShowPin((p) => !p)}>
                      {showPin ? <EyeOff size={18} color={Colors.textMuted} /> : <Eye size={18} color={Colors.textMuted} />}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CONFIRM PIN</Text>
                  <View style={styles.inputRow}>
                    <Lock size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                    <TextInput style={styles.input} value={confirmPin} onChangeText={(v) => setConfirmPin(v.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="••••••" placeholderTextColor={Colors.textMuted} keyboardType="number-pad" secureTextEntry={!showPin} maxLength={6} onSubmitEditing={handleSignup} />
                  </View>
                </View>

                <TouchableOpacity style={[styles.btn, localLoading && { opacity: 0.75 }]} onPress={handleSignup} disabled={localLoading} activeOpacity={0.85}>
                  {localLoading ? <ActivityIndicator color={Colors.white} /> : (
                    <>
                      <Text style={styles.btnText}>CREATE ACCOUNT</Text>
                      <ArrowRight size={20} color={Colors.white} strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginLabel}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.loginLink}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.05,
    paddingBottom: 28,
  },
  logoWrap: {
    width: 64, height: 64,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  logo: { width: 40, height: 40 },
  appName: { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: 3, marginTop: 12 },
  progressBar: { flexDirection: 'row', gap: 8, marginTop: 16 },
  progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.primary },

  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 32,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  cardSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 28, lineHeight: 18 },

  inputGroup: { width: '100%', marginBottom: 18 },
  label: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.black,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 16, height: 54,
  },
  phonePrefix: { color: Colors.white, fontWeight: '700', fontSize: 15, marginRight: 6 },
  phoneDivider: { width: 1, height: 20, backgroundColor: Colors.border, marginRight: 12 },
  input: { flex: 1, color: Colors.white, fontSize: 15, fontWeight: '500' },
  otpInput: { fontSize: 24, fontWeight: '800', letterSpacing: 10, textAlign: 'center' },
  hint: { color: Colors.textMuted, fontSize: 11, marginTop: 6 },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  resendLink: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

  btn: {
    width: '100%', height: 56, borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    marginTop: 4,
  },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },

  loginRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  loginLabel: { color: Colors.textMuted, fontSize: 14 },
  loginLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
