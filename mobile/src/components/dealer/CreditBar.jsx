import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { CREDIT_THRESHOLDS } from '../../constants/app';
import { formatINR } from '../../utils/currency';

export default function CreditBar({ used = 0, limit = 0 }) {
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  
  // High contrast indicator colors for Carbon Dark
  const color = percent >= 80 ? Colors.error // Above 80% usage is Danger
    : percent >= 50 ? Colors.primary // Above 50% is Warning (Orange)
    : '#4ADE80'; // Safe Green (High Visibility)

  return (
    <View style={styles.container}>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {percent.toFixed(0)}% LIMIT REACHED
        </Text>
        <Text style={styles.limitText}>
          AVAIL: {formatINR(Math.max(0, limit - used))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.sm },
  barTrack: {
    height: 4,
    backgroundColor: Colors.black,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  limitText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
