import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import useProductStore from '../../../src/store/useProductStore';
import ProductCard from '../../../src/components/product/ProductCard';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import AppLoader from '../../../src/components/common/AppLoader';
import AppEmpty from '../../../src/components/common/AppEmpty';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import useDebounce from '../../../src/hooks/useDebounce';

const FILTERS = ['all', 'active', 'archived'];

export default function ProductsScreen() {
  const { products, isLoading, error, fetchProducts } = useProductStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchProducts({ q: debouncedSearch, status: filter });
  }, [debouncedSearch, filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/products/add')}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchWrap}><AppSearchBar value={search} onChangeText={setSearch} /></View>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !products.length ? <AppLoader /> :
       error ? <AppError message={error} onRetry={() => fetchProducts()} /> : (
        <FlatList
          data={products}
          keyExtractor={(p) => p._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          refreshing={isLoading}
          onRefresh={() => fetchProducts({ q: debouncedSearch, status: filter })}
          ListEmptyComponent={<AppEmpty title="No products found" actionLabel="Add Product" onAction={() => router.push('/(app)/products/add')} />}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => router.push(`/(app)/products/${item._id}/edit`)} />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/products/add')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingBottom: 0 },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.text },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  addText: { color: Colors.white, fontWeight: Typography.fontWeight.bold },
  searchWrap: { padding: Spacing.base, paddingBottom: Spacing.sm },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLighter },
  chipText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
  grid: { padding: Spacing.base },
  fab: { position: 'absolute', bottom: Spacing['2xl'], right: Spacing.base, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  fabText: { color: Colors.white, fontSize: 28, fontWeight: Typography.fontWeight.bold, lineHeight: 32 },
});
