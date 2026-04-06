import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useProductStore from '../../../src/store/useProductStore';
import ProductCard from '../../../src/components/product/ProductCard';
import AppHeader from '../../../src/components/common/AppHeader';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import AppLoader from '../../../src/components/common/AppLoader';
import AppEmpty from '../../../src/components/common/AppEmpty';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';
import { Spacing } from '../../../src/theme/spacing';
import useDebounce from '../../../src/hooks/useDebounce';

const FILTERS = ['ALL', 'ACTIVE', 'LOW STOCK'];

export default function ProductsScreen() {
  const { products, isLoading, error, fetchProducts } = useProductStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchProducts({ q: debouncedSearch, status: filter.toLowerCase() });
  }, [debouncedSearch, filter]);

  const onRefresh = useCallback(() => {
    fetchProducts({ q: debouncedSearch, status: filter.toLowerCase() });
  }, [debouncedSearch, filter]);

  const RightAction = (
    <TouchableOpacity 
      style={styles.addBtn} 
      activeOpacity={0.8}
      onPress={() => router.push('/(app)/products/add')}
    >
      <Feather name="box" size={20} color={Colors.black} />
      <Feather name="plus" size={12} color={Colors.black} style={styles.plusIcon} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      <AppHeader title="INVENTORY" rightAction={RightAction} />

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
              title="NO PRODUCTS FOUND"
              subtitle="ADD YOUR FIRST SKU TO GET STARTED"
              actionLabel="ADD PRODUCT"
              onAction={() => router.push('/(app)/products/add')}
            />
          }
          renderItem={({ item }) => (
            <ProductCard 
              product={item} 
              onPress={() => router.push(`/(app)/products/${item._id}/edit`)} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerControls: {
    padding: Spacing.base,
    backgroundColor: Colors.black,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'row',
  },
  plusIcon: { marginLeft: -2, marginTop: -8 },
  filterRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.black, 
  },
  filterText: { 
    fontSize: 9, 
    color: Colors.textMuted, 
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  filterTextActive: { 
    color: Colors.primary, 
  },
  grid: { padding: 8, paddingBottom: 100 },
});
