import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { List, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { formatInr } from '../../utils/format';
import { colors } from '../../theme';

type Product = {
  _id: string;
  name: string;
  sellingPrice: number;
  manufacturingCost: number;
  stockQuantity: number;
  profitMarginPercent: number;
  lowStock: boolean;
};

export function ProductListScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.products ?? []);
    } catch {
      setProducts([]);
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

  return (
    <View style={styles.wrap}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Mfg ${formatInr(item.manufacturingCost)} → Sell ${formatInr(item.sellingPrice)}`}
            right={() => (
              <View style={styles.right}>
                {item.lowStock ? (
                  <Chip compact icon="alert" style={{ marginBottom: 4 }}>
                    Low
                  </Chip>
                ) : null}
                <Text style={{ color: colors.profit }}>{item.profitMarginPercent.toFixed(1)}% margin</Text>
                <Text style={{ fontSize: 11, opacity: 0.8 }}>Stock {item.stockQuantity}</Text>
              </View>
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  right: { alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 },
});
