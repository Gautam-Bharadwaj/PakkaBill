import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import InvoiceCard from '../../../src/components/invoice/InvoiceCard';
import AppLoader from '../../../src/components/common/AppLoader';
import AppEmpty from '../../../src/components/common/AppEmpty';
import AppError from '../../../src/components/common/AppError';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
];

export default function InvoicesScreen() {
  const { invoices, isLoading, error, fetchInvoices } = useInvoiceStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchInvoices({ status: filter }); }, [filter]);

  const onRefresh = useCallback(() => { fetchInvoices({ status: filter }); }, [filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/invoices/new')}>
          <Text style={styles.addText}>+ New</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.value} style={[styles.chip, filter === f.value && styles.chipActive]} onPress={() => setFilter(f.value)}>
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !invoices.length ? <AppLoader /> :
       error ? <AppError message={error} onRetry={onRefresh} /> : (
        <FlatList
          data={invoices}
          keyExtractor={(inv) => inv._id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<AppEmpty title="No invoices" actionLabel="Create Invoice" onAction={() => router.push('/(app)/invoices/new')} />}
          renderItem={({ item }) => (
            <InvoiceCard invoice={item} onPress={() => router.push(`/(app)/invoices/${item._id}`)} />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/invoices/new')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base, paddingBottom: Spacing.sm },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.text },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  addText: { color: Colors.white, fontWeight: Typography.fontWeight.bold },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLighter },
  chipText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
  list: { padding: Spacing.base },
  fab: { position: 'absolute', bottom: Spacing['2xl'], right: Spacing.base, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  fabText: { color: Colors.white, fontSize: 28, fontWeight: Typography.fontWeight.bold, lineHeight: 32 },
});
