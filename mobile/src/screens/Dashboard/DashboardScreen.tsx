import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { formatInr } from '../../utils/format';
import { colors } from '../../theme';

type Summary = {
  monthToDate: { revenue: number; profit: number; marginPct: number };
  yearToDate: { revenue: number; profit: number; marginPct: number };
  pendingPayments: { total: number };
  topSelling: { _id: string; name: string; qty: number }[];
  topProfitable: { _id: string; name: string; profit: number }[];
  recentInvoices: { invoiceId: string; totalAmount: number; paymentStatus: string }[];
  lowStock: { name: string; stockQuantity: number }[];
};

export function DashboardScreen() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data: res } = await api.get('/dashboard/summary');
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  if (!data && loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
      <Card style={styles.card}>
        <Card.Title title="This month" />
        <Card.Content>
          <Text style={styles.titleMd}>Revenue {formatInr(data?.monthToDate.revenue ?? 0)}</Text>
          <Text style={{ color: colors.profit, fontSize: 16 }}>
            Profit {formatInr(data?.monthToDate.profit ?? 0)} ({(data?.monthToDate.marginPct ?? 0).toFixed(1)}%)
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Pending payments" />
        <Card.Content>
          <Text style={{ color: colors.due, fontSize: 18, fontWeight: '600' }}>
            {formatInr(data?.pendingPayments.total ?? 0)}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Top selling (qty)" />
        <Card.Content>
          {(data?.topSelling ?? []).slice(0, 5).map((item) => (
            <Text key={item._id}>
              {item.name}: {item.qty} units
            </Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Recent invoices" />
        <Card.Content>
          {(data?.recentInvoices ?? []).map((invoice) => (
            <View key={invoice.invoiceId}>
              <Text>
                {invoice.invoiceId} — {formatInr(invoice.totalAmount)} ({invoice.paymentStatus})
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Low stock" />
        <Card.Content>
          {(data?.lowStock ?? []).length === 0 ? (
            <Text>All good</Text>
          ) : (
            (data?.lowStock ?? []).map((product) => (
              <Text key={product.name}>
                {product.name}: {product.stockQuantity} left
              </Text>
            ))
          )}
        </Card.Content>
      </Card>

      <Divider style={{ marginVertical: 16 }} />
      <View style={{ paddingHorizontal: 8 }}>
        <Text style={styles.subheader}>ML insights (cached)</Text>
        <Text style={styles.hint}>
          Run ML service and proxy from backend to populate insights card.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, padding: 12 },
  card: { marginBottom: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { opacity: 0.7 },
  titleMd: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  hint: { paddingHorizontal: 8, opacity: 0.7, fontSize: 14 },
  subheader: { fontSize: 14, fontWeight: '600', marginBottom: 8, paddingHorizontal: 8 },
});
