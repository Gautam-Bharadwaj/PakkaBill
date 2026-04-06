import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useAuthStore from '../../src/store/useAuthStore';
import AppButton from '../../src/components/common/AppButton';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../src/theme/spacing';

const schema = z.object({ pin: z.string().length(6, 'PIN must be exactly 6 digits') });

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { login, isLoading } = useAuthStore();
  const { handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKey = async (key) => {
    if (isLoading) return;
    if (key === '⌫') {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setValue('pin', newPin);
      return;
    }
    if (key === '✓') {
      if (pin.length === 6) {
        await doLogin();
      }
      return;
    }
    if (pin.length >= 6) return;
    const newPin = pin + key;
    setPin(newPin);
    setValue('pin', newPin);
    if (newPin.length === 6) {
      await doLogin(newPin);
    }
  };

  const doLogin = async (p = pin) => {
    try {
      await login({ pin: p });
      router.replace('/(app)/dashboard');
    } catch (err) {
      shake();
      setPin('');
      setValue('pin', '');
      showMessage({ message: err.message || 'Invalid PIN', type: 'danger', icon: 'danger' });
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {/* Top blue section */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer} />
        <Text style={styles.appName}>Billo Billings</Text>
        <Text style={styles.tagline}>Smart wholesale billing</Text>
      </View>

      {/* White card section */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subheading}>Enter your 6-digit PIN</Text>

          {/* PIN dots */}
          <Animated.View style={[styles.pinRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={[styles.pinDot, pin.length > i && styles.pinDotFilled]} />
            ))}
          </Animated.View>

          {errors.pin && <Text style={styles.error}>{errors.pin.message}</Text>}

          {/* Numpad */}
          <View style={styles.numpad}>
            {NUMPAD.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.key,
                  key === '✓' && styles.keySubmit,
                  key === '⌫' && styles.keyBack,
                ]}
                onPress={() => handleKey(key)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={[styles.keyText, key === '✓' && styles.keySubmitText]}>
                  {isLoading && key === '✓' ? '...' : key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },
  flex: { flex: 1 },
  topSection: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  logoContainer: { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, marginBottom: Spacing.md },
  appName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.fontSize.md, marginTop: Spacing.xs },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
    ...Shadow.lg,
  },
  heading: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.text,
  },
  subheading: { fontSize: Typography.fontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing['2xl'] },
  pinRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  pinDotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  error: { color: Colors.danger, fontSize: Typography.fontSize.sm, marginBottom: Spacing.md },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', marginTop: Spacing.xl, gap: Spacing.sm, justifyContent: 'center' },
  key: {
    width: '30%',
    aspectRatio: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    ...Shadow.sm,
  },
  keySubmit: { backgroundColor: Colors.primary },
  keyBack: { backgroundColor: Colors.dangerLight },
  keyText: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  keySubmitText: { color: Colors.white },
});
