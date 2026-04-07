import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AppModal from '../common/AppModal';
import AppSearchBar from '../common/AppSearchBar';
import AppLoader from '../common/AppLoader';
import AppEmpty from '../common/AppEmpty';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import { formatINR } from '../../utils/currency';
import { getProducts } from '../../api/product.api';
import useDebounce from '../../hooks/useDebounce';
import logger from '../../utils/logger';

export default function ProductPickerModal({ visible, onClose, onSelect }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getProducts({ q: debouncedSearch, limit: 50 });
        setProducts(data.data || []);
      } catch (err) {
        logger.error('[ProductPicker] fetch', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, debouncedSearch]);

  return (
    <AppModal visible={visible} onClose={onClose} title="Select Product">
      <AppSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search products..."
        style={styles.search}
      />
      {loading ? (
        <AppLoader label="Loading products..." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p._id}
          style={styles.list}
          ListEmptyComponent={<AppEmpty title="No products found" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, item.stockQuantity <= 5 && styles.itemWarning]}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.name.toUpperCase()}</Text>
                <View style={styles.itemMeta}>
                   <Text style={styles.itemPrice}>{formatINR(item.sellingPrice)}</Text>
                   <View style={styles.dot} />
                   <Text style={styles.itemSku}>{item.sku || 'NO-SKU'}</Text>
                </View>
              </View>
              <View style={styles.stockCol}>
                <Text style={[styles.stockLabel, item.stockQuantity <= 5 && { color: Colors.error }]}>STOCK</Text>
                <Text style={[styles.stockValue, item.stockQuantity <= 5 && { color: Colors.error }]}>{item.stockQuantity}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  search: { marginBottom: Spacing.md },
  list: { maxHeight: 320 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 8,
    borderRadius: 12,
  },
  itemWarning: { backgroundColor: 'rgba(255, 51, 51, 0.05)', borderColor: 'rgba(255, 51, 51, 0.2)' },
  itemMain: { flex: 1, gap: 4 },
  itemName: { fontSize: 14, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  itemSku: { fontSize: 10, fontWeight: '600', color: Colors.textMuted },
  stockCol: { alignItems: 'flex-end', marginLeft: 16 },
  stockLabel: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1 },
  stockValue: { fontSize: 16, fontWeight: '900', color: Colors.white },
});
