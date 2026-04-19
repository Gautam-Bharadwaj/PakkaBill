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

export default function DealerPickerModal({ visible, onClose, onSelect, multiSelect = false }) {
  const [dealers, setDealers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
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

  const handleSelect = (item) => {
    if (multiSelect) {
      if (selectedIds.includes(item._id)) {
        setSelectedIds(prev => prev.filter(id => id !== item._id));
      } else {
        setSelectedIds(prev => [...prev, item._id]);
      }
    } else {
      onSelect(item);
      onClose();
    }
  };

  const handleConfirmBulk = () => {
    const selectedDealers = dealers.filter(d => selectedIds.includes(d._id));
    onSelect(selectedDealers);
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title={multiSelect ? "SELECT CUSTOMERS (BULK)" : "SELECT CUSTOMER"}>
      <AppSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name, shop, or phone..."
        style={styles.search}
      />
      {loading ? (
        <AppLoader label="Loading customers..." />
      ) : (
        <>
          <FlatList
            data={dealers}
            keyExtractor={(d) => d._id}
            style={styles.list}
            ListEmptyComponent={<AppEmpty title="No customers found" subtitle="Try adjusting your search" />}
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item._id);
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && { borderColor: Colors.primary, backgroundColor: 'rgba(255,107,0,0.05)' }]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.avatar}>
                     <UserCircle size={24} color={isSelected ? Colors.primary : Colors.textMuted} strokeWidth={2} />
                  </View>
                  <View style={styles.itemMain}>
                    <Text style={[styles.itemName, isSelected && { color: Colors.primary }]}>{item.name.toUpperCase()}</Text>
                    <View style={styles.itemMeta}>
                       <Text style={styles.itemShop}>{item.shopName.toUpperCase()}</Text>
                       <View style={styles.dot} />
                       <Text style={styles.itemPhone}>{item.phone}</Text>
                    </View>
                  </View>
                  {multiSelect && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Text style={styles.checkInner}>✓</Text>}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
          {multiSelect && selectedIds.length > 0 && (
            <TouchableOpacity style={styles.bulkConfirmBtn} onPress={handleConfirmBulk}>
               <Text style={styles.bulkConfirmText}>CONFIRM {selectedIds.length} CUSTOMERS</Text>
            </TouchableOpacity>
          )}
        </>
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatar: { marginRight: 16 },
  itemMain: { flex: 1, gap: 4 },
  itemName: { fontSize: 13, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemShop: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  itemPhone: { fontSize: 10, fontWeight: '600', color: Colors.textMuted },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkInner: { color: Colors.black, fontSize: 12, fontWeight: '900' },
  bulkConfirmBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 16, marginTop: 16, alignItems: 'center' },
  bulkConfirmText: { color: Colors.black, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
