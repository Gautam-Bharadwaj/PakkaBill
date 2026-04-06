import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { recordPayment } from '../../../src/api/payment.api';
import { getInvoice } from '../../../src/api/invoice.api';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import AppCard from '../../../src/components/common/AppCard';
import AppLoader from '../../../src/components/common/AppLoader';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';

const MODES = [['cash', 'Cash'], ['upi', 'UPI'], ['bank', 'Bank']];

export default function RecordPaymentScreen() {
  const { invoiceId } = useLocalSearchParams();
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [upiRef, setUpiRef] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getInvoice(invoiceId);
        setInvoice(data.data);
        setAmount(String(data.data.amountDue || ''));
      } catch { } finally { setLoading(false); }
    })();
  }, [invoiceId]);

  const handleSubmit = async () => {
    if (!amount || isNaN(+amount) || +amount <= 0) {
      showMessage({ message: 'Enter a valid amount', type: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await recordPayment({ invoiceId, amount: +amount, mode, upiReference: upiRef, note });
      showMessage({ message: 'Payment recorded!', type: 'success', icon: 'success' });
      router.back();
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'Failed to record', type: 'danger' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <AppLoader fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
          <Text style={styles.title}>Record Payment</Text>

          {/* Invoice summary */}
          {invoice && (
            <AppCard style={styles.invCard}>
              <Text style={styles.invId}>{invoice.invoiceId}</Text>
              <Text style={styles.invDealer}>{invoice.dealerName}</Text>
              <Text style={styles.invTotal}>Total: {formatINR(invoice.totalAmount)}</Text>
            </AppCard>
          )}

          {/* Due amount display */}
          <View style={styles.dueBox}>
            <Text style={styles.dueLabel}>Amount Due</Text>
            <Text style={styles.dueAmount}>{formatINR(invoice?.amountDue || 0)}</Text>
          </View>

          {/* Form */}
          <AppInput label="Amount *" value={amount} onChangeText={setAmount} prefix="₹" keyboardType="numeric" />

          <Text style={styles.label}>Payment Mode</Text>
          <View style={styles.modeRow}>
            {MODES.map(([val, label]) => (
              <TouchableOpacity key={val} style={[styles.modeChip, mode === val && styles.modeActive]} onPress={() => setMode(val)}>
                <Text style={[styles.modeText, mode === val && styles.modeTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'upi' && (
            <AppInput label="UPI Reference" value={upiRef} onChangeText={setUpiRef} placeholder="UTR / Reference number" />
          )}
          <AppInput label="Note (optional)" value={note} onChangeText={setNote} placeholder="Any notes..." multiline numberOfLines={2} />

          <AppButton title="Record Payment" onPress={handleSubmit} loading={submitting} fullWidth style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  back: { color: Colors.primary, fontWeight: Typography.fontWeight.semibold, marginBottom: Spacing.md },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.text, marginBottom: Spacing.lg },
  invCard: { marginBottom: Spacing.md },
  invId: { fontSize: Typography.fontSize.sm, color: Colors.primary, fontWeight: Typography.fontWeight.bold, fontFamily: 'monospace' },
  invDealer: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text, marginTop: 2 },
  invTotal: { fontSize: Typography.fontSize.md, color: Colors.textSecondary, marginTop: 2 },
  dueBox: { backgroundColor: Colors.dangerLight, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg },
  dueLabel: { fontSize: Typography.fontSize.sm, color: Colors.danger, fontWeight: Typography.fontWeight.medium },
  dueAmount: { fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.danger, marginTop: 4 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  modeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  modeChip: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  modeActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLighter },
  modeText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  modeTextActive: { color: Colors.primary, fontWeight: Typography.fontWeight.bold },
  btn: { marginTop: Spacing.md },
});
