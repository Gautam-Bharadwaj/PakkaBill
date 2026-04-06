import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

const VARIANTS = {
  primary: { bg: Colors.primaryLighter, text: Colors.primary },
  success: { bg: Colors.successLight, text: Colors.success },
  danger: { bg: Colors.dangerLight, text: Colors.danger },
  warning: { bg: Colors.warningLight, text: Colors.warning },
  muted: { bg: Colors.surface, text: Colors.textSecondary },
};

export default function AppBadge({ label, variant = 'primary', style }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
