import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing, Radius, Shadow } from '../../theme/spacing';

export default function AppSearchBar({ value, onChangeText, placeholder = 'Search...', onClear, style }) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(''))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    ...Shadow.sm,
    height: 44,
  },
  icon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
  },
});
