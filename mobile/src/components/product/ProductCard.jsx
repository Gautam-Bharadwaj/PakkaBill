import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Package, AlertTriangle, Trash2 } from 'lucide-react-native';
import AppCard from '../common/AppCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';

export default function ProductCard({ product, onPress, onDelete }) {
  const isLowStock = product.stockQuantity <= (product.lowStockThreshold || 10);
  const margin = product.profitMarginPercent || 0;

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.9}>
      <AppCard style={[styles.card, isLowStock && styles.cardLowStock]}>
        <View style={styles.header}>
          <View style={styles.skuBadge}>
            <Text style={styles.skuText}>#{product.sku?.substring(0, 5).toUpperCase() || 'SKU'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            {isLowStock && (
              <AlertTriangle size={14} color={Colors.primary} strokeWidth={2.5} />
            )}
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation(); onDelete(); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.trashCircle}>
                 <Trash2 size={14} color={Colors.danger} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={2}>{product.name.toUpperCase()}</Text>
        
        <View style={styles.priceRow}>
           <Text style={styles.price}>{formatINR(product.sellingPrice)}</Text>
           <Text style={styles.marginText}>{margin.toFixed(0)}% MARGIN</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View>
             <Text style={styles.stockLabel}>IN STOCK</Text>
             <Text style={[styles.stockValue, isLowStock && { color: Colors.primary }]}>
               {product.stockQuantity} {product.unit || 'PCS'}
             </Text>
          </View>
          <Package size={16} color={isLowStock ? Colors.primary : Colors.textMuted} strokeWidth={2} />
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
    padding: 20,
    borderRadius: 24,
  },
  cardLowStock: { borderColor: Colors.primaryLighter || Colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  skuBadge: { backgroundColor: Colors.black, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  skuText: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1.5 },
  name: { fontSize: 13, fontWeight: '900', color: Colors.white, height: 40, marginBottom: 12, letterSpacing: 0.5, lineHeight: 18 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  price: { fontSize: 18, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  marginText: { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 20, opacity: 0.3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockLabel: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 2 },
  stockValue: { fontSize: 14, fontWeight: '900', color: Colors.white },
  trashCircle: {
     width: 32,
     height: 32,
     borderRadius: 16,
     backgroundColor: 'rgba(239, 68, 68, 0.1)',
     alignItems: 'center',
     justifyContent: 'center',
     borderWidth: 1,
     borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
