import React, { useState, useEffect, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Text, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import useDealerStore from '../../../src/store/useDealerStore';
import DealerCard from '../../../src/components/dealer/DealerCard';
import AppHeader from '../../../src/components/common/AppHeader';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import AppLoader from '../../../src/components/common/AppLoader';
import AppEmpty from '../../../src/components/common/AppEmpty';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import useDebounce from '../../../src/hooks/useDebounce';

const FILTERS = ['ALL', 'ACTIVE', 'BLOCKED'];

export default function DealersScreen() {
  const { dealers, isLoading, error, fetchDealers } = useDealerStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchDealers({ q: debouncedSearch, status: filter.toLowerCase() });
  }, [debouncedSearch, filter]);

  const onRefresh = useCallback(() => {
    fetchDealers({ q: debouncedSearch, status: filter.toLowerCase() });
  }, [debouncedSearch, filter]);

  const RightAction = (
    <TouchableOpacity 
      style={styles.addBtn} 
      activeOpacity={0.8}
      onPress={() => router.push('/(app)/dealers/add')}
    >
      <Feather name="user-plus" size={20} color={Colors.black} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      {/* Normalized Top Navbar */}
      <AppHeader 
        title="ACCOUNTS" 
        rightAction={RightAction} 
      />

      <View style={styles.headerControls}>
        <AppSearchBar 
          value={search} 
          onChangeText={setSearch} 
          placeholder="SEARCH CUSTOMERS..." 
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

      {isLoading && !dealers.length ? (
        <AppLoader fullScreen label="Syncing Accounts..." />
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
              subtitle="ADD YOUR FIRST DEALER TO GET STARTED"
              actionLabel="ADD ACCOUNT"
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
    width: 36, 
    height: 36, 
    borderRadius: 8, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
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
    fontSize: 10, 
    color: Colors.textMuted, 
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  filterTextActive: { 
    color: Colors.primary, 
  },
  list: { padding: Spacing.base, paddingBottom: 100 },
});
