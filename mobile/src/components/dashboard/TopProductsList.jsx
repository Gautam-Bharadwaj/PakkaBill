import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import AppCard from '../common/AppCard';

export default function TopProductsList({ products = [] }) {
  if (!products.length) return null;

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Top Selling Products</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((p, i) => (
          <View key={p._id} style={styles.chip}>
            <Text style={styles.rank}>#{i + 1}</Text>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.units}>{p.unitsSold} units</Text>
          </View>
        ))}
      </ScrollView>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  title: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  chip: {
    backgroundColor: Colors.primaryLighter,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    minWidth: 120,
    alignItems: 'center',
  },
  rank: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.primary },
  name: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.text, textAlign: 'center', marginTop: 4 },
  units: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
