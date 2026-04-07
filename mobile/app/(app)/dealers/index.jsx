import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { UserPlus, Search, SlidersHorizontal } from 'lucide-react-native';
import useDealerStore from '../../../src/store/useDealerStore';
import DealerCard from '../../../src/components/dealer/DealerCard';
import AppHeader from '../../../src/components/common/AppHeader';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import AppLoader from '../../../src/components/common/AppLoader';
import AppEmpty from '../../../src/components/common/AppEmpty';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';

const FILTERS = ['ALL', 'ACTIVE', 'BLOCKED'];

export default function DealersScreen() {
  const { dealers, isLoading, error, fetchDealers } = useDealerStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchDealers({ q: search, status: filter.toLowerCase() });
  }, [search, filter]);

  const onRefresh = useCallback(() => {
    fetchDealers({ q: search, status: filter.toLowerCase() });
  }, [search, filter]);

  const RightAction = (
    <TouchableOpacity 
      style={styles.addBtn} 
      activeOpacity={0.8}
      onPress={() => router.push('/(app)/dealers/add')}
    >
      <UserPlus size={24} color={Colors.black} strokeWidth={2.5} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="CUSTOMER ROSTER" showBack rightAction={RightAction} />

      <View style={styles.headerControls}>
        <AppSearchBar 
          value={search} 
          onChangeText={setSearch} 
          placeholder="SEARCH CUSTOMERS..." 
        />
        
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBase}>
             <SlidersHorizontal size={14} color={Colors.textMuted} strokeWidth={2.5} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {isLoading && !dealers.length ? (
        <AppLoader fullScreen label="ENGINEERING CUSTOMER DATA..." />
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
              title="NO ACCOUNTS FOUND"
              subtitle="REGISTER YOUR FIRST CUSTOMER TO BEGIN BILLING"
              actionLabel="ADD CUSTOMER"
              onAction={() => router.push('/(app)/dealers/add')}
              icon="users"
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
    </View>
  );
}

// Fixed import for ScrollView
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
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
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  filterBase: { width: 44, height: 44, backgroundColor: Colors.surface, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  filterScroll: { flex: 1 },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 10,
  },
  filterActive: { borderColor: Colors.primary, backgroundColor: Colors.black },
  filterText: { fontSize: 10, color: Colors.textMuted, fontWeight: '900', letterSpacing: 1 },
  filterTextActive: { color: Colors.primary },
  list: { padding: 24, paddingBottom: 120 },
});
