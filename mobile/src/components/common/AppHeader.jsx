import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

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
            <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
          ) : leftAction ? (
            leftAction
          ) : logo ? (
            <View style={styles.logoFrame}>
               <Feather name="zap" size={20} color={Colors.primary} />
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
              {subtitle && <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text>}
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
  container: {
    backgroundColor: Colors.black,
    paddingBottom: Spacing.sm,
  },
  border: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  inner: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backBtn: {
    padding: 2,
  },
  logoFrame: {
    width: 32,
    height: 32,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 8,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
});
