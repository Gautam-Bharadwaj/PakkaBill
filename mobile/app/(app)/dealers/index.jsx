import React, { useState, useEffect, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import useDealerStore from '../../../src/store/useDealerStore';
import DealerCard from '../../../src/components/dealer/DealerCard';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import AppLoader from '../../../src/components/common/AppLoader';
import AppEmpty from '../../../src/components/common/AppEmpty';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import useDebounce from '../../../src/hooks/useDebounce';

const FILTERS = ['all', 'active', 'blocked'];

export default function DealersScreen() {
  const { dealers, isLoading, error, fetchDealers, deleteDealer } = useDealerStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchDealers({ q: debouncedSearch, status: filter });
  }, [debouncedSearch, filter]);

  const onRefresh = useCallback(() => {
    fetchDealers({ q: debouncedSearch, status: filter });
  }, [debouncedSearch, filter]);

  const handleDelete = (dealer) => {
    Alert.alert(
      'Delete Dealer',
      `Are you sure you want to delete ${dealer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteDealer(dealer._id);
              showMessage({ message: 'Dealer deleted', type: 'success' });
            } catch {
              showMessage({ message: 'Delete failed', type: 'danger' });
            }
          },
        },
      ]
    );
  };

  const renderFilters = () => (
    <View style={styles.filterRow}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.filterChip, filter === f && styles.filterActive]}
          onPress={() => setFilter(f)}
        >
          <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Dealers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/dealers/add')}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <AppSearchBar value={search} onChangeText={setSearch} placeholder="Search dealers..." />
      </View>
      {renderFilters()}

      {isLoading && !dealers.length ? (
        <AppLoader />
      ) : error ? (
        <AppError message={error} onRetry={onRefresh} />
      ) : (
        <FlatList
          data={dealers}
          keyExtractor={(d) => d._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <AppEmpty
              title="No dealers found"
              subtitle="Add your first dealer to get started"
              actionLabel="Add Dealer"
              onAction={() => router.push('/(app)/dealers/add')}
            />
          }
          renderItem={({ item }) => (
            <DealerCard
              dealer={item}
              onPress={() => router.push(`/(app)/dealers/${item._id}`)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/dealers/add')}>
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
  searchContainer: { padding: Spacing.base, paddingBottom: Spacing.sm },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLighter },
  filterText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },
  filterTextActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
  list: { padding: Spacing.base },
  fab: {
    position: 'absolute',
    bottom: Spacing['2xl'],
    right: Spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  fabText: { color: Colors.white, fontSize: 28, fontWeight: Typography.fontWeight.bold, lineHeight: 32 },
});
