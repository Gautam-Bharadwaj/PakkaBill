import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';
import AppButton from './AppButton';

export default function AppError({ message = 'Something went wrong', onRetry }) {
  return (
    <View style={styles.container}>
      <View style={styles.errorIcon} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <AppButton title="Try Again" onPress={onRetry} variant="secondary" style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    margin: Spacing.base,
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.lg,
  },
  errorIcon: { width: 40, height: 40, backgroundColor: Colors.danger, borderRadius: Radius.full, marginBottom: Spacing.sm, opacity: 0.2 },
  message: {
    fontSize: Typography.fontSize.md,
    color: Colors.danger,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  btn: { marginTop: Spacing.md },
});
