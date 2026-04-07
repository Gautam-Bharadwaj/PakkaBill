import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  KeyboardAvoidingView, Platform, StatusBar, Dimensions, Image,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { Zap, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useAuthStore from '../../src/store/useAuthStore';
import { Colors } from '../../src/theme/colors';
import { Typography } from '../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../src/theme/spacing';
import AppSearchBar from '../../src/components/common/AppSearchBar';

const schema = z.object({ 
  name: z.string().min(1, 'OWNER NAME IS REQUIRED'),
  pin: z.string().length(6, 'PIN MUST BE 6 DIGITS') 
});

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'done'];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { login, isLoading } = useAuthStore();
  const { setValue, formState: { errors } } = useForm({ 
    resolver: zodResolver(schema),
    defaultValues: { name: '', pin: '' }
  });

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
    if (key === 'del') {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setValue('pin', newPin);
      return;
    }
    if (key === 'done') {
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
    if (!name.trim()) {
        showMessage({ message: 'PLEASE ENTER OWNER NAME', type: 'warning' });
        return;
    }
    try {
      await login({ name: name.trim(), pin: p });
      router.replace('/(app)/dashboard');
    } catch (err) {
      shake();
      setPin('');
      setValue('pin', '');
      showMessage({ message: err.message || 'Verification Failed', type: 'danger', icon: 'danger' });
    }
  };

  const PinSlot = ({ filled, index }) => {
    const scale = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      if (filled) {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }).start();
      } else {
        Animated.timing(scale, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      }
    }, [filled]);

    return (
      <View style={styles.slotContainer}>
        <View style={[styles.pinSlot, filled && styles.pinSlotActive]}>
          <Animated.View 
            style={[
              styles.pinValue, 
              { transform: [{ scale }] }
            ]} 
          />
        </View>
      </View>
    );
  };

  const Key = ({ val }) => {
    const scale = useRef(new Animated.Value(1)).current;
    
    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => handleKey(val)}
        disabled={isLoading}
        activeOpacity={1}
        style={[
          styles.key,
          val === 'done' && styles.keySubmit,
          val === 'del' && styles.keyBack,
        ]}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center', justifyContent: 'center' }}>
          {val === 'done' ? (
            isLoading ? <Text style={[styles.keyText, styles.keySubmitText]}>...</Text> : <ArrowRight size={28} color={Colors.black} strokeWidth={2.5} />
          ) : val === 'del' ? (
            <ChevronLeft size={24} color={Colors.white} strokeWidth={2.5} />
          ) : (
            <Text style={styles.keyText}>{val}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      {/* Hyper-Modern Header - Adaptive Height */}
      <View style={[styles.topSection, { height: SCREEN_HEIGHT * 0.28, justifyContent: 'flex-end', paddingBottom: 20 }]}>
        <View style={styles.logoFrame}>
          <Image 
            source={require('../../assets/pakkabill_logo.png')} 
            style={{ width: 60, height: 60 }} 
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

      {/* Industrial Login Card */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex}
      >
        <View style={[styles.card, { paddingBottom: 20 }]}>
          <View style={styles.headerInfo}>
            <Text style={styles.heading}>Pin Authorization</Text>
            <Text style={styles.subheading}>Enter Name & PIN for system access</Text>
          </View>

          {/* New Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>MASTER OWNER ID / NAME</Text>
            <AppSearchBar 
                value={name} 
                onChangeText={(v) => { setName(v); setValue('name', v); }} 
                placeholder="ENTER NAME..." 
                style={styles.nameInput}
            />
          </View>

          {/* Styled PIN Slots - Tighter Margin */}
          <Text style={[styles.inputLabel, { marginTop: 24, alignSelf: 'center' }]}>6-DIGIT SECURITY PIN</Text>
          <Animated.View style={[styles.pinRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <PinSlot key={i} index={i} filled={pin.length > i} />
            ))}
          </Animated.View>

          {errors.pin && <Text style={styles.error}>{errors.pin.message}</Text>}

          {/* Circular Numpad Grid - Responsive Gap */}
          <View style={styles.numpad}>
            {NUMPAD.map((val) => (
              <Key key={val} val={val} />
            ))}
          </View>
          {/* Register Link */}
          <TouchableOpacity 
             style={styles.signupBtn} 
             onPress={() => router.push('/(auth)/signup')}
             activeOpacity={0.8}
          >
             <Text style={styles.signupHelper}>DON'T HAVE AN ACCOUNT? <Text style={styles.signupLink}>REGISTER BUSINESS</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const keySize = Math.min(SCREEN_WIDTH * 0.18, 70); // Slightly smaller for better fit
const keyGap = SCREEN_WIDTH * 0.04;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  logoFrame: { 
    width: 90, 
    height: 90, 
    backgroundColor: Colors.card, 
    borderRadius: 24, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
    marginTop: 16,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  tagLine: {
    height: 1,
    width: 16,
    backgroundColor: 'rgba(255, 107, 0, 0.3)',
  },
  taglineText: { 
    color: Colors.primary, 
    fontSize: 10, 
    fontWeight: '700', 
    letterSpacing: 1,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 10,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  inputContainer: { width: '100%', marginBottom: 10 },
  inputLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 10 },
  nameInput: { backgroundColor: Colors.surface, borderRadius: 18, height: 60, borderColor: Colors.border },
  headerInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  subheading: { 
    fontSize: 12, 
    color: Colors.textSecondary, 
    marginTop: 8, 
    textAlign: 'center',
    lineHeight: 18,
  },
  pinRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  slotContainer: {
    width: 46,
    height: 64,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pinSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSlotActive: {
    borderColor: Colors.primary,
  },
  pinValue: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  error: { color: Colors.error, fontSize: 13, marginBottom: 20, fontWeight: '600' },
  numpad: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: '100%', 
    gap: keyGap, 
    justifyContent: 'center',
    marginTop: 10,
  },
  key: {
    width: keySize,
    height: keySize,
    borderRadius: keySize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  keySubmit: { 
    backgroundColor: Colors.primary, 
    borderColor: Colors.primary,
  },
  keyBack: { 
    backgroundColor: 'transparent', 
    borderColor: 'transparent', 
  },
  keyText: { fontSize: 28, fontWeight: '600', color: Colors.white },
  signupBtn: { marginTop: 50, paddingBottom: 40 },
  signupHelper: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
  signupLink: { color: Colors.primary, fontWeight: '900' },
});
