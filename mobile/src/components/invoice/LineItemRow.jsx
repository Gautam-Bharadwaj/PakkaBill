import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trash2, Minus, Plus } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { formatINR } from '../../utils/currency';
export default function LineItemRow({ item, onQtyChange, onRemove }) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.productName.toUpperCase()}</Text>
          <Text style={styles.priceMeta}>{formatINR(item.unitPrice)} PER UNIT</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Trash2 size={18} color={Colors.error} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.leftCol}>
          <View style={styles.stepperBox}>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => onQtyChange(Math.max(1, item.quantity - 1))}
            >
              <Minus size={16} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.valueWrap}>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
            </View>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => onQtyChange(item.quantity + 1)}
            >
              <Plus size={16} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.rapidQtyRow}>
             {[1, 2, 5, 10].map(val => (
               <TouchableOpacity 
                 key={val} 
                 style={[styles.rapidBtn, item.quantity === val && styles.rapidBtnActive]} 
                 onPress={() => onQtyChange(val)}
               >
                 <Text style={[styles.rapidText, item.quantity === val && styles.rapidTextActive]}>X{val}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.totalsBox}>
          <Text style={styles.totalLabel}>ITEM TOTAL</Text>
          <Text style={styles.totalPrice}>{formatINR(item.lineTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { flex: 1 },
  productName: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: Colors.white,
    letterSpacing: 0.5,
  },
  priceMeta: { 
    fontSize: 10, 
    color: Colors.textSecondary, 
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 1,
  },
  removeBtn: { padding: 10, backgroundColor: 'rgba(255, 51, 51, 0.08)', borderRadius: 12 },
  bottomRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  leftCol: { gap: 12 },
  stepperBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.background, 
    borderRadius: 14, 
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 2,
    width: 140,
  },
  stepBtn: { 
    width: 44, 
    height: 44, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 12,
  },
  valueWrap: {
    flex: 1,
    alignItems: 'center',
  },
  qtyValue: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: Colors.white,
  },
  rapidQtyRow: { flexDirection: 'row', gap: 6 },
  rapidBtn: { 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8, 
    backgroundColor: Colors.background, 
    borderWidth: 1, 
    borderColor: Colors.border 
  },
  rapidBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rapidText: { fontSize: 10, fontWeight: '800', color: Colors.textMuted },
  rapidTextActive: { color: Colors.black },
  totalsBox: { alignItems: 'flex-end', paddingBottom: 4 },
  totalLabel: { fontSize: 9, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 4 },
  totalPrice: { 
    fontSize: 20, 
    fontWeight: '900', 
    color: Colors.primary,
  },
});
