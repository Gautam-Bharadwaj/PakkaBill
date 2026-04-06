import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { Feather } from '@expo/vector-icons';
import useAuthStore from '../../src/store/useAuthStore';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../src/theme/spacing';

const schema = z.object({ pin: z.string().length(6, 'PIN must be exactly 6 digits') });

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { login, isLoading } = useAuthStore();
  const { setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

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
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      {/* Carbon Dark Header */}
      <View style={styles.topSection}>
        <View style={styles.logoFrame}>
          <Feather name="zap" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>PAKKABILL</Text>
        <Text style={styles.tagline}>PREMIUM BILLING SYSTEM</Text>
      </View>

      {/* Industrial Login Card */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.card}>
          <Text style={styles.heading}>SECURITY PIN</Text>
          <Text style={styles.subheading}>PROVIDE YOUR 6-DIGIT AUTHORIZATION</Text>

          {/* Bold PIN Indicators */}
          <Animated.View style={[styles.pinRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={[styles.pinDot, pin.length > i && styles.pinDotFilled]} />
            ))}
          </Animated.View>

          {errors.pin && <Text style={styles.error}>{errors.pin.message}</Text>}

          {/* High-Contrast Numpad */}
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
                {key === '✓' && isLoading ? (
                   <Text style={[styles.keyText, styles.keySubmitText]}>...</Text>
                ) : (
                  <Text style={[styles.keyText, key === '✓' && styles.keySubmitText, key === '⌫' && styles.keyBackText]}>
                    {key}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  flex: { flex: 1 },
  topSection: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  logoFrame: { 
    width: 80, 
    height: 80, 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.lg, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary, // Orange accent border
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  tagline: { 
    color: Colors.primary, 
    fontSize: 10, 
    fontWeight: '800', 
    marginTop: 4, 
    letterSpacing: 3,
    opacity: 0.8 
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface, // #121212
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  heading: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  subheading: { 
    fontSize: 10, 
    color: Colors.textSecondary, 
    marginTop: 8, 
    marginBottom: Spacing['3xl'],
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  pinRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: 40 },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.black,
  },
  pinDotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  error: { color: Colors.error, fontSize: Typography.fontSize.sm, marginBottom: Spacing.md },
  numpad: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: '100%', 
    gap: Spacing.sm, 
    justifyContent: 'center' 
  },
  key: {
    width: '30%',
    aspectRatio: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  keySubmit: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  keyBack: { backgroundColor: 'rgba(255, 51, 51, 0.1)', borderColor: Colors.error },
  keyText: { fontSize: 22, fontWeight: '700', color: Colors.white },
  keySubmitText: { color: Colors.black, fontWeight: '900' },
  keyBackText: { color: Colors.error },
});
