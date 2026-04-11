import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import AppModal from '../common/AppModal';
import AppSearchBar from '../common/AppSearchBar';
import AppLoader from '../common/AppLoader';
import AppEmpty from '../common/AppEmpty';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { getDealers } from '../../api/dealer.api';
import useDebounce from '../../hooks/useDebounce';
import logger from '../../utils/logger';

export default function DealerPickerModal({ visible, onClose, onSelect }) {
  const [dealers, setDealers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getDealers({ q: debouncedSearch, limit: 50, status: 'active' });
        setDealers(data.data || []);
      } catch (err) {
        logger.error('[DealerPicker] fetch', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, debouncedSearch]);

  return (
    <AppModal visible={visible} onClose={onClose} title="SELECT CUSTOMER">
      <AppSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name, shop, or phone..."
        style={styles.search}
      />
      {loading ? (
        <AppLoader label="Loading customers..." />
      ) : (
        <FlatList
          data={dealers}
          keyExtractor={(d) => d._id}
          style={styles.list}
          ListEmptyComponent={<AppEmpty title="No customers found" subtitle="Try adjusting your search" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => { onSelect(item); onClose(); }}
            >
              <View style={styles.avatar}>
                 <UserCircle size={24} color={Colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.name.toUpperCase()}</Text>
                <View style={styles.itemMeta}>
                   <Text style={styles.itemShop}>{item.shopName.toUpperCase()}</Text>
                   <View style={styles.dot} />
                   <Text style={styles.itemPhone}>{item.phone}</Text>
                </View>
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
  list: { maxHeight: 380 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 8,
    borderRadius: 12,
  },
  avatar: { marginRight: 16 },
  itemMain: { flex: 1, gap: 4 },
  itemName: { fontSize: 14, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemShop: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  itemPhone: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
});
