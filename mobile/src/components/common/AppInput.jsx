import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius } from '../../theme/spacing';

export default function AppInput({
  label,
  error,
  prefix,
  suffix,
  onSuffixPress,
  containerStyle,
  inputStyle,
  ...props
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.textMuted}
          {...props}
        />
        {suffix && (
          <TouchableOpacity onPress={onSuffixPress} disabled={!onSuffixPress}>
            {typeof suffix === 'string' ? <Text style={styles.suffix}>{suffix}</Text> : suffix}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
  },
  inputError: { borderColor: Colors.danger },
  prefix: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  suffix: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginLeft: Spacing.xs,
  },
  error: {
    fontSize: Typography.fontSize.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});
