import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  KeyboardAvoidingView, Platform, StatusBar, ScrollView,
  TextInput, ActivityIndicator, Image, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../src/store/useAuthStore';
import { Colors } from '../../src/theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { login, isLoading } = useAuthStore();

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const doLogin = async () => {
    if (!name.trim()) {
      showMessage({ message: 'Owner name is required', type: 'warning' });
      shake();
      return;
    }
    if (!pin.trim() || pin.length < 6) {
      showMessage({ message: 'Please enter your 6-digit PIN', type: 'warning' });
      shake();
      return;
    }
    try {
      await login({ name: name.trim(), pin: pin.trim() });
      router.replace('/(app)/dashboard');
    } catch (err) {
      shake();
      showMessage({ message: err.message || 'Login failed', type: 'danger', icon: 'danger' });
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/pakkabill_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>PAKKABILL</Text>
            <View style={styles.taglineRow}>
              <View style={styles.tagLine} />
              <Text style={styles.taglineText}>PREMIUM BILLING SYSTEM</Text>
              <View style={styles.tagLine} />
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Sign in to continue to your store</Text>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }], width: '100%' }}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>OWNER NAME</Text>
                <View style={styles.inputRow}>
                  <User size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* PIN Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-DIGIT PIN</Text>
                <View style={styles.inputRow}>
                  <Lock size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={pin}
                    onChangeText={(v) => setPin(v.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="••••••"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    secureTextEntry={!showPin}
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={doLogin}
                  />
                  <TouchableOpacity onPress={() => setShowPin((p) => !p)} style={styles.eyeBtn}>
                    {showPin ? <EyeOff size={18} color={Colors.textMuted} /> : <Eye size={18} color={Colors.textMuted} />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.btn, isLoading && { opacity: 0.75 }]}
                onPress={doLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.btnText}>ENTER SYSTEM</Text>
                    <ArrowRight size={20} color={Colors.white} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Signup Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupLabel}>New to PakkaBill?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}> Create Account</Text>
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
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: 32,
  },
  logoWrap: {
    width: 72, height: 72,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20,
  },
  logo: { width: 44, height: 44 },
  appName: {
    fontSize: 30, fontWeight: '900', color: Colors.white,
    letterSpacing: 3, marginTop: 14,
  },
  taglineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  tagLine: { height: 1, width: 20, backgroundColor: 'rgba(255,107,0,0.4)' },
  taglineText: { color: Colors.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 32,
    borderTopWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  cardSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 32 },

  inputGroup: { width: '100%', marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.black,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 16, height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.white, fontSize: 15, fontWeight: '500' },
  eyeBtn: { padding: 4 },

  btn: {
    width: '100%', height: 56, borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    marginTop: 8,
  },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },

  signupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  signupLabel: { color: Colors.textMuted, fontSize: 14 },
  signupLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
