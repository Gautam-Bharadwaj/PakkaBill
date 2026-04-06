import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import AppButton from './AppButton';

export default function AppEmpty({ title = 'Nothing here yet', subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.emptyIcon} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <AppButton title={actionLabel} onPress={onAction} style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'] },
  emptyIcon: { width: 64, height: 64, backgroundColor: Colors.surface, borderRadius: 32, marginBottom: Spacing.lg },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  btn: { marginTop: Spacing.lg },
});
