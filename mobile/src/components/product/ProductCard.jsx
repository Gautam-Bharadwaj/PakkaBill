import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppCard from '../common/AppCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';

export default function ProductCard({ product, onPress }) {
  const isLowStock = product.stockQuantity <= (product.lowStockThreshold || 10);
  const margin = product.profitMarginPercent || 0;

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.9}>
      <AppCard style={styles.card} shadow="sm">
        <View style={styles.header}>
          <View style={styles.skuBadge}>
            <Text style={styles.skuText}>#{product.sku?.substring(0, 4).toUpperCase() || 'SKU'}</Text>
          </View>
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <Feather name="alert-triangle" size={10} color={Colors.black} />
              <Text style={styles.lowStockText}> LOW STOCK</Text>
            </View>
          )}
        </View>

        <Text style={styles.name} numberOfLines={2}>{product.name.toUpperCase()}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatINR(product.sellingPrice)}</Text>
          <Text style={styles.marginText}>{margin.toFixed(0)}% MARGIN</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.stockLabel}>STOCK LEVEL</Text>
          <Text style={[styles.stockValue, isLowStock && { color: Colors.error }]}>
            {product.stockQuantity} {product.unit || 'PCS'}
          </Text>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: 8 },
  card: { 
    flex: 1, 
    backgroundColor: Colors.surface, 
    borderWidth: 1.5, 
    borderColor: Colors.border,
    padding: 16,
    borderRadius: Radius.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  skuBadge: { backgroundColor: Colors.black, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: Colors.border },
  skuText: { fontSize: 9, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1 },
  lowStockBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4 
  },
  lowStockText: { fontSize: 8, color: Colors.black, fontWeight: '900', letterSpacing: 1 },
  name: { fontSize: 13, fontWeight: '800', color: Colors.white, height: 38, marginBottom: 12, letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  price: { fontSize: 18, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  marginText: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 16, opacity: 0.5 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockLabel: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1.5 },
  stockValue: { fontSize: 12, fontWeight: '900', color: Colors.white },
});
