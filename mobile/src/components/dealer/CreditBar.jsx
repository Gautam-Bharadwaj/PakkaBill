import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { CREDIT_THRESHOLDS } from '../../constants/app';
import { formatINR } from '../../utils/currency';

export default function CreditBar({ used = 0, limit = 0 }) {
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const color = percent >= CREDIT_THRESHOLDS.WARNING ? Colors.danger
    : percent >= CREDIT_THRESHOLDS.SAFE ? Colors.warning
    : Colors.success;

  return (
    <View style={styles.container}>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.label}>
        {formatINR(used)} of {formatINR(limit)} used ({percent.toFixed(0)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.sm },
  barTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
