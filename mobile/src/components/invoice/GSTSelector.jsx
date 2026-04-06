import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { GST_RATES } from '../../constants/gst';

export default function GSTSelector({ value, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>GST Rate</Text>
      <View style={styles.chips}>
        {GST_RATES.map((rate) => (
          <TouchableOpacity
            key={rate.value}
            style={[styles.chip, value === rate.value && styles.chipActive]}
            onPress={() => onChange(rate.value)}
          >
            <Text style={[styles.chipText, value === rate.value && styles.chipTextActive]}>
              {rate.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLighter },
  chipText: { fontSize: Typography.fontSize.md, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },
  chipTextActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
});
