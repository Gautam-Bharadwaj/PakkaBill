import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View, Animated } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

const VARIANTS = {
  primary: {
    container: { backgroundColor: Colors.primary },
    pressed: { backgroundColor: Colors.primaryDark },
    text: { color: Colors.black, fontWeight: '800' }, // Bold black text on orange
  },
  secondary: {
    container: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.primary },
    pressed: { backgroundColor: Colors.primaryLight },
    text: { color: Colors.primary, fontWeight: '700' },
  },
  dark: {
    container: { backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.border },
    pressed: { backgroundColor: Colors.surface },
    text: { color: Colors.white, fontWeight: '700' },
  },
  accent: {
    container: { backgroundColor: Colors.white },
    pressed: { backgroundColor: Colors.primaryLighter },
    text: { color: Colors.black, fontWeight: '800' },
  },
  danger: {
    container: { backgroundColor: Colors.error },
    pressed: { backgroundColor: Colors.danger },
    text: { color: Colors.white, fontWeight: '700' },
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
    pressed: { backgroundColor: 'rgba(255,255,255,0.05)' },
    text: { color: Colors.white, fontWeight: '500' },
  },
  success: {
    container: { backgroundColor: Colors.success },
    pressed: { backgroundColor: Colors.primaryDark },
    text: { color: Colors.white, fontWeight: '700' },
  },
};

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) {
  const animatedScale = React.useRef(new Animated.Value(1)).current;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.96, // More aggressive scale for "Industrial" feel
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const sizeStyles = {
    sm: { height: 44, paddingHorizontal: Spacing.md },
    md: { height: 56, paddingHorizontal: Spacing.lg }, // 56px height
    lg: { height: 64, paddingHorizontal: Spacing['2xl'] },
  }[size] || {};

  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }], width: fullWidth ? '100%' : 'auto' }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          v.container,
          pressed && v.pressed,
          sizeStyles,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text.color} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[styles.text, v.text, textStyle]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md, // 12px for buttons
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: Spacing.sm },
  text: {
    fontSize: Typography.fontSize.md,
    letterSpacing: 0.5,
  },
});
