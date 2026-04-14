import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { router } from 'expo-router';

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftAction,
  rightAction,
  logo = false,
  border = true,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { paddingTop: Math.max(insets.top, 16) },
      border && styles.border
    ]}>
      <View style={styles.inner}>
        {/* Left Side */}
        <View style={styles.left}>
          {showBack ? (
            <TouchableOpacity 
              onPress={onBack || (() => router.back())} 
              style={styles.backBtn} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : leftAction ? (
            leftAction
          ) : logo ? (
            <View style={styles.logoFrame}>
               <Image 
                 source={require('../../../assets/pakkabill_logo.png')} 
                 style={styles.logoImage} 
                 resizeMode="contain" 
               />
            </View>
          ) : null}
        </View>

        {/* Center Side */}
        <View style={styles.center}>
          {logo ? (
            <Text style={styles.logoText}>PAKKABILL</Text>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.title} numberOfLines={1}>{title?.toUpperCase()}</Text>
              {!!subtitle && <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text>}
            </View>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.right}>
          {rightAction || <View style={{ width: 24 }} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.background, paddingBottom: Spacing.sm },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  inner: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  left: { flex: 1, alignItems: 'flex-start' },
  center: { flex: 4, alignItems: 'center', justifyContent: 'center' },
  right: { flex: 1, alignItems: 'flex-end' },
  logoFrame: { width: 40, height: 40, backgroundColor: Colors.surface, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImage: { width: 32, height: 32 },
  logoText: { fontSize: 18, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  title: { fontSize: 14, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  subtitle: { fontSize: 8, color: Colors.primary, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
