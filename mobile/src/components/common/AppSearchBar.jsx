import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, XCircle } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';

export default function AppSearchBar({ value, onChangeText, placeholder = 'Search...', onClear, style }) {
  return (
    <View style={[styles.container, style]}>
      <Search size={20} color={Colors.primary} strokeWidth={2.5} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never"
        selectionColor={Colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(''))} style={styles.clearBtn}>
          <XCircle size={18} color={Colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
});
