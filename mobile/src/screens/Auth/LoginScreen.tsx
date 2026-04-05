import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput, HelperText } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(phone.replace(/\D/g, ''), pin);
    } catch (error: unknown) {
      setError('Login failed. Check phone, PIN, and API URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Billo</Text>
        <Text style={styles.sub}>Wholesale notebook — owner login</Text>
        <TextInput
          label="Phone (10 digit)"
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          style={styles.field}
        />
        <TextInput
          label="PIN"
          mode="outlined"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
          style={styles.field}
        />
        {error ? <HelperText type="error">{error}</HelperText> : null}
        <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading}>
          Sign in
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  card: { gap: 12 },
  title: { textAlign: 'center', marginBottom: 4, fontSize: 28, fontWeight: '600' },
  sub: { textAlign: 'center', marginBottom: 16, opacity: 0.7, fontSize: 15 },
  field: { marginBottom: 4 },
});
