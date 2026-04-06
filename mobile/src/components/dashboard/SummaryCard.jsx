import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function SummaryCard({ title, value, icon, color = Colors.primary, change }) {
  return (
    <AppCard style={[styles.card, { borderTopColor: color, borderTopWidth: 3 }]}>
      <View style={styles.row}>
        {change !== undefined && (
          <Text style={[styles.change, { color: change >= 0 ? Colors.success : Colors.danger }]}>
            {change >= 0 ? '+' : '-'} {Math.abs(change)}%
          </Text>
        )}
      </View>
      <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.title}>{title}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: '45%', margin: Spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  icon: { fontSize: 24 },
  value: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    marginBottom: 2,
  },
  title: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  change: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold },
});
