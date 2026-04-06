import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';

export default function LineItemRow({ item, onQtyChange, onRemove }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
          <Text style={styles.priceMeta}>{formatINR(item.unitPrice)} / unit</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Feather name="trash-2" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.stepper}>
          <TouchableOpacity 
            style={styles.stepBtn} 
            onPress={() => onQtyChange(Math.max(1, item.quantity - 1))}
          >
            <Feather name="minus" size={16} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.qtyContainer}>
            <Text style={styles.qtyText}>{item.quantity}</Text>
          </View>
          <TouchableOpacity 
            style={styles.stepBtn} 
            onPress={() => onQtyChange(item.quantity + 1)}
          >
            <Feather name="plus" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.totals}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatINR(item.lineTotal)}</Text>
        </View>
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  productName: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: Colors.white,
    letterSpacing: 0.5,
  },
  priceMeta: { 
    fontSize: 12, 
    color: Colors.textSecondary, 
    marginTop: 2,
    fontWeight: '600',
  },
  removeBtn: { padding: 4 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stepper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.black, 
    borderRadius: 8, 
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
  },
  stepBtn: { 
    width: 32, 
    height: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 6,
  },
  qtyContainer: {
    paddingHorizontal: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  qtyText: { 
    fontSize: 15, 
    fontWeight: '900', 
    color: Colors.white,
  },
  totals: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: 2 },
  totalValue: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: Colors.primary,
  },
});
