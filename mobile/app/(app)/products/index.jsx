import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Package, Plus, PackageSearch, AlertTriangle } from 'lucide-react-native';
import useProductStore from '../../../src/store/useProductStore';
import ProductCard from '../../../src/components/product/ProductCard';
import AppHeader from '../../../src/components/common/AppHeader';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import AppLoader from '../../../src/components/common/AppLoader';
import AppEmpty from '../../../src/components/common/AppEmpty';
import AppError from '../../../src/components/common/AppError';
import ConfirmModal from '../../../src/components/common/ConfirmModal';
import { Colors } from '../../../src/theme/colors';

const FILTERS = ['ALL', 'ACTIVE', 'LOW STOCK'];

export default function ProductsScreen() {
  const { products, isLoading, error, fetchProducts, deleteProduct } = useProductStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchProducts({ q: debouncedSearch, status: filter.toLowerCase() });
  }, [debouncedSearch, filter]);

  const onRefresh = useCallback(() => {
    fetchProducts({ q: debouncedSearch, status: filter.toLowerCase() });
  }, [debouncedSearch, filter]);

  const handleDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      setShowModal(false);
      require('react-native-flash-message').showMessage({ message: 'PRODUCT DELETED', type: 'success' });
    } catch (err) {
      require('react-native-flash-message').showMessage({ message: 'DELETE FAILED', type: 'danger' });
    }
  };

  const RightAction = (
    <TouchableOpacity 
      style={styles.addBtn} 
      activeOpacity={0.8}
      onPress={() => router.push('/(app)/products/add')}
    >
      <Plus size={24} color={Colors.black} strokeWidth={2.5} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      <AppHeader title="STOCK & INVENTORY" showBack rightAction={RightAction} />

      <View style={styles.headerControls}>
        <AppSearchBar 
          value={search} 
          onChangeText={setSearch} 
          placeholder="SEARCH BY NAME OR SKU..." 
        />
        
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && !products.length ? (
        <AppLoader fullScreen label="Syncing Stock..." />
      ) : error ? (
        <AppError message={error} onRetry={onRefresh} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <AppEmpty
              title="NO STOCK RECORDED"
              subtitle="ADD YOUR FIRST PRODUCT SKU TO BEGIN TRACKING SALES"
              actionLabel="ADD PRODUCT"
              onAction={() => router.push('/(app)/products/add')}
            />
          }
          renderItem={({ item }) => (
            <ProductCard 
              product={item} 
              onPress={() => router.push(`/(app)/products/${item._id}/edit`)} 
              onDelete={() => handleDelete(item._id, item.name)}
            />
          )}
        />
      )}
      <ConfirmModal 
        visible={showModal}
        title="DELETE PRODUCT"
        message={`Are you sure you want to remove ${deleteName.toUpperCase()} from your stock? This action is permanent.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowModal(false)}
      />
    </View>
  );
}

// Minimal Debounce for better performance
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerControls: {
    padding: 24,
    backgroundColor: Colors.black,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  addBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  filterRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.black, 
  },
  filterText: { 
    fontSize: 10, 
    color: Colors.textMuted, 
    fontWeight: '900',
    letterSpacing: 1,
  },
  filterTextActive: { 
    color: Colors.primary, 
  },
  grid: { padding: 12, paddingBottom: 120 },
});
