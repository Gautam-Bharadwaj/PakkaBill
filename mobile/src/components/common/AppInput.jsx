import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
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
  isPassword,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputRow, 
        isFocused && styles.inputFocused, 
        error && styles.inputError
      ]}>
        {prefix && (
          <View style={styles.prefix}>
            {typeof prefix === 'string' ? <Text style={styles.prefixText}>{prefix}</Text> : prefix}
          </View>
        )}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          secureTextEntry={isPassword && !showPassword}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.suffixWrap}>
             {showPassword ? <EyeOff size={20} color={Colors.textMuted} /> : <Eye size={20} color={Colors.primary} />}
          </TouchableOpacity>
        )}
        {suffix && !isPassword && (
          <TouchableOpacity onPress={onSuffixPress} disabled={!onSuffixPress} style={styles.suffixWrap}>
            {typeof suffix === 'string' ? <Text style={styles.suffixText}>{suffix}</Text> : suffix}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border, // #2A2A2A
    borderRadius: 12, // 12px per industrial look
    backgroundColor: Colors.surface, // #121212
    paddingHorizontal: Spacing.md,
    height: 52, // Slightly taller for dark mode
  },
  inputFocused: { borderColor: Colors.primary },
  inputError: { borderColor: Colors.error },
  prefix: {
    marginRight: Spacing.xs,
  },
  prefixText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    height: '100%',
    fontWeight: '500',
  },
  suffixWrap: {
    marginLeft: Spacing.xs,
  },
  suffixText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: '700',
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 2,
  },
});
