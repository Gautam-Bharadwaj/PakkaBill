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
              style={styles.item}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{formatINR(item.sellingPrice)}</Text>
              </View>
              <Text style={styles.stock}>Stock: {item.stockQuantity}</Text>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.text },
  itemPrice: { fontSize: Typography.fontSize.sm, color: Colors.primary, marginTop: 2 },
  stock: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },
});
