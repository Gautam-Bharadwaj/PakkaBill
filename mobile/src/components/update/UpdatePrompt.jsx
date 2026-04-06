import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppModal from '../common/AppModal';
import AppButton from '../common/AppButton';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function UpdatePrompt({ visible, onUpdate, onLater }) {
  return (
    <AppModal visible={visible} title="Update Available" showClose={false}>
      <Text style={styles.body}>
        A new version of Billo Billings is ready. Update now for the latest features and improvements.
      </Text>
      <View style={styles.buttons}>
        <AppButton title="Update Now" onPress={onUpdate} fullWidth style={styles.btn} />
        <AppButton title="Later" onPress={onLater} variant="ghost" fullWidth style={styles.btn} />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: Typography.fontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  buttons: { gap: Spacing.sm },
  btn: { marginTop: Spacing.xs },
});
