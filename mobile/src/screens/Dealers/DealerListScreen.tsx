import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { List, Searchbar, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../api/client';
import { formatInr } from '../../utils/format';
import { colors } from '../../theme';

type Dealer = {
  _id: string;
  name: string;
  phone: string;
  shopName: string;
  creditLimit: number;
  pendingAmount: number;
  overLimit?: boolean;
};

export function DealerListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/dealers', { params: { q: searchQuery } });
      setDealers(data.dealers ?? []);
    } catch {
      setDealers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  return (
    <View style={styles.wrap}>
      <Searchbar placeholder="Search dealers" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={load} />
      <FlatList
        data={dealers}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`${item.shopName} · ${item.phone}`}
            right={() => (
              <View style={styles.right}>
                {item.overLimit ? <Chip compact textStyle={{ color: '#fff' }} style={{ backgroundColor: colors.due }}>Over limit</Chip> : null}
                <Text style={item.pendingAmount > 0 ? { color: colors.due } : { color: colors.profit }}>
                  Due {formatInr(item.pendingAmount)}
                </Text>
              </View>
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 8 },
  right: { alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8, gap: 4 },
});
