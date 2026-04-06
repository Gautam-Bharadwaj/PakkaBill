import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function AppLoader({ label = 'Loading...', fullScreen = false }) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  label: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
});
