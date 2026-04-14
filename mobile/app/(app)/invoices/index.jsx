import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, History } from 'lucide-react-native';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import InvoiceCard from '../../../src/components/invoice/InvoiceCard';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import AppHeader from '../../../src/components/common/AppHeader';
import AppSearchBar from '../../../src/components/common/AppSearchBar';
import { Colors } from '../../../src/theme/colors';

const FILTERS = [
  { label: 'ALL BILLS', value: 'all' },
  { label: 'PENDING', value: 'unpaid' },
  { label: 'PARTIAL', value: 'partial' },
  { label: 'PAID', value: 'paid' },
];

export default function InvoicesScreen() {
  const localParams = useLocalSearchParams();
  const params = localParams || {};
  const status = params.status;
  const { invoices, isLoading, error, fetchInvoices } = useInvoiceStore();
  const [filter, setFilter] = useState(status || 'all');
  const [search, setSearch] = useState('');

  useEffect(() => { 
    if (params.status && params.status !== filter) {
      setFilter(params.status);
    }
  }, [params.status]);

  useEffect(() => { 
    fetchInvoices({ status: filter, q: search }); 
  }, [filter, search]);

  const onRefresh = useCallback(() => { 
    fetchInvoices({ status: filter, q: search }); 
  }, [filter, search]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader 
        title="BILLING HISTORY" 
        showBack 
        rightAction={
          <TouchableOpacity 
            style={styles.headerPlus} 
            onPress={() => router.push('/(app)/invoices/new')}
          >
            <Plus size={24} color={Colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
        }
      />

      <View style={styles.filterSection}>
        <AppSearchBar 
           value={search} 
           onChangeText={setSearch} 
           placeholder="SEARCH BILLS BY CUSTOMER OR ID..." 
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity 
              key={f.value} 
              activeOpacity={0.7}
              style={[styles.chip, filter === f.value && styles.chipActive]} 
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && !invoices.length ? (
        <AppLoader fullScreen label="Searching history..." />
      ) : error ? (
        <AppError message={error} onRetry={onRefresh} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(inv) => inv._id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <View style={styles.emptyIconWrap}>
                 <History size={48} color={Colors.border} strokeWidth={1} />
               </View>
               <Text style={styles.emptyTitle}>NO BILLS FOUND</Text>
               <Text style={styles.emptySub}>YOU HAVEN'T CREATED ANY BILLS IN THIS CATEGORY YET.</Text>
               <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={() => router.push('/(app)/invoices/new')}
               >
                 <Text style={styles.emptyBtnText}>CREATE YOUR FIRST BILL</Text>
               </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <InvoiceCard 
              invoice={item} 
              onPress={() => router.push(`/(app)/invoices/${item._id}`)} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  filterSection: { 
    padding: 24,
    backgroundColor: Colors.black,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  filterScroll: { marginTop: 16, gap: 10 },
  chip: { 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: Colors.border, 
    backgroundColor: Colors.surface,
  },
  chipActive: { 
    borderColor: Colors.primary, 
    backgroundColor: Colors.black,
  },
  chipText: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  chipTextActive: { 
    color: Colors.primary, 
  },
  list: { padding: 20, paddingBottom: 120 },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 100 
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: Colors.white, 
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySub: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: Colors.textMuted, 
    textAlign: 'center',
    width: '80%',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  emptyBtn: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.black,
  },
  fab: { 
    position: 'absolute', 
    bottom: 32, 
    right: 24, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: Colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
});
