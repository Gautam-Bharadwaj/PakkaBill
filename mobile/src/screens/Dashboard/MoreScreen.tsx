import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';
import { API_BASE } from '../../api/client';

const CACHE_KEY = 'billo.dashboard.cache';

export function MoreScreen() {
  const logout = useAuthStore((s) => s.logout);
  const [cacheInfo, setCacheInfo] = useState<string>('—');

  const clearCache = async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
    setCacheInfo('Cleared');
  };

  const checkUpdate = async () => {
    // Wire GITHUB_OWNER / GITHUB_REPO via env in a real build; placeholder:
    const url = 'https://api.github.com/repos/OWNER/REPO/releases/latest';
    try {
      const r = await fetch(url);
      if (!r.ok) {
        setCacheInfo('Update check failed (configure repo URL).');
        return;
      }
      const j = await r.json();
      setCacheInfo(`Latest release: ${j.tag_name}`);
    } catch {
      setCacheInfo('Network error');
    }
  };

  return (
    <ScrollView style={styles.scroll}>
      <Card style={styles.card}>
        <Card.Title title="API" />
        <Card.Content>
          <Text style={styles.small}>Base URL (dev Android emulator → host 10.0.2.2)</Text>
          <Text selectable>{API_BASE}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Updates" />
        <Card.Content>
          <Button mode="outlined" onPress={checkUpdate} style={{ marginBottom: 8 }}>
            Check GitHub release (configure URL in code)
          </Button>
          <Text style={styles.small}>{cacheInfo}</Text>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Item title="Offline cache" description="Dashboard/dealers cache keys reserved" onPress={clearCache} />
        <List.Item
          title="Documentation"
          onPress={() => Linking.openURL('https://github.com')}
          description="See /docs in repo"
        />
      </List.Section>

      <View style={styles.pad}>
        <Button mode="contained-tonal" onPress={() => logout()}>
          Sign out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, padding: 12 },
  card: { marginBottom: 12 },
  pad: { padding: 16, paddingBottom: 32 },
  small: { fontSize: 13, opacity: 0.75 },
});
