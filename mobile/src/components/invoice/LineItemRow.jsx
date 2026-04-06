import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';

export default function LineItemRow({ item, onQtyChange, onPriceChange, onDiscountChange, onRemove }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.remove}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controls}>
        {/* Qty stepper */}
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => onQtyChange(Math.max(1, item.quantity - 1))}>
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => onQtyChange(item.quantity + 1)}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>{formatINR(item.unitPrice)} × {item.quantity}</Text>
          <Text style={styles.lineTotal}>{formatINR(item.lineTotal)}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.profit, { color: item.lineProfit >= 0 ? Colors.success : Colors.danger }]}>
          Profit: {formatINR(item.lineProfit)}
        </Text>
        <Text style={styles.discount}>Disc: {item.discountPercent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { flex: 1, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  remove: { fontSize: 18, color: Colors.danger, fontWeight: Typography.fontWeight.bold },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, overflow: 'hidden' },
  stepBtn: { backgroundColor: Colors.primaryLighter, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  stepText: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.primary },
  qty: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, paddingHorizontal: Spacing.md, color: Colors.text },
  priceInfo: { alignItems: 'flex-end' },
  price: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  lineTotal: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  profit: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold },
  discount: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },
});
