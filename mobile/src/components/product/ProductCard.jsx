import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { MARGIN_THRESHOLDS } from '../../constants/app';

export default function ProductCard({ product, onPress }) {
  const margin = product.profitMarginPercent || 0;
  const marginColor = margin >= MARGIN_THRESHOLDS.MEDIUM ? Colors.success
    : margin >= MARGIN_THRESHOLDS.LOW ? Colors.warning
    : Colors.danger;
  const isLowStock = product.stockQuantity <= product.lowStockThreshold;

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.88}>
      <AppCard style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>Low</Text>
            </View>
          )}
        </View>
        <Text style={styles.price}>₹{product.sellingPrice?.toFixed(2)}</Text>
        <View style={styles.footer}>
          <Text style={[styles.margin, { color: marginColor }]}>{margin.toFixed(1)}% margin</Text>
          <Text style={styles.stock}>Stock: {product.stockQuantity}</Text>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: Spacing.xs },
  card: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  name: { flex: 1, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginRight: Spacing.xs },
  lowStockBadge: { backgroundColor: Colors.warningLight, paddingHorizontal: Spacing.xs, paddingVertical: 2, borderRadius: Radius.sm },
  lowStockText: { fontSize: Typography.fontSize.xs, color: Colors.warning, fontWeight: Typography.fontWeight.bold },
  price: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.primary, marginBottom: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  margin: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold },
  stock: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },
});
