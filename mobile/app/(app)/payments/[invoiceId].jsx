import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import { recordPayment, getPaymentsByInvoice, deletePayment } from '../../../src/api/payment.api';
import { getInvoice } from '../../../src/api/invoice.api';
import AppInput from '../../../src/components/common/AppInput';
import AppButton from '../../../src/components/common/AppButton';
import AppCard from '../../../src/components/common/AppCard';
import AppLoader from '../../../src/components/common/AppLoader';
import AppHeader from '../../../src/components/common/AppHeader';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radius } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';
import { Trash2, History, AlertCircle } from 'lucide-react-native';

const MODES = [['cash', 'Cash'], ['upi', 'UPI'], ['bank', 'Bank']];

export default function RecordPaymentScreen() {
  const { invoiceId } = useLocalSearchParams();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [upiRef, setUpiRef] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        getInvoice(invoiceId),
        getPaymentsByInvoice(invoiceId)
      ]);
      setInvoice(invRes.data.data);
      setPayments(payRes.data.data || []);
      setAmount(String(invRes.data.data.amountDue || ''));
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
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
      loadData();
      setAmount('');
      setUpiRef('');
      setNote('');
    } catch (err) {
      showMessage({ message: err.response?.data?.message || 'Failed to record', type: 'danger' });
    } finally { setSubmitting(false); }
  };

  const handleDeletePayment = async (payId) => {
    try {
      await deletePayment(payId);
      showMessage({ message: 'Payment reversed successfully', type: 'success' });
      loadData();
    } catch (err) {
      showMessage({ message: 'Failed to delete payment', type: 'danger' });
    }
  };

  if (loading) return <AppLoader fullScreen />;

  return (
    <View style={styles.root}>
      <AppHeader title="RECORD PAYMENT" showBack={true} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

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
          <AppInput label="ENTER AMOUNT PAID *" value={amount} onChangeText={setAmount} prefix="₹" keyboardType="numeric" />

          <Text style={styles.label}>PAYMENT MODE</Text>
          <View style={styles.modeRow}>
            {MODES.map(([val, label]) => (
              <TouchableOpacity key={val} style={[styles.modeChip, mode === val && styles.modeActive]} onPress={() => setMode(val)}>
                <Text style={[styles.modeText, mode === val && styles.modeTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'upi' && (
            <AppInput label="UPI REFERENCE NO." value={upiRef} onChangeText={setUpiRef} placeholder="UTR / Reference number" />
          )}
          <AppInput label="NOTES (OPTIONAL)" value={note} onChangeText={setNote} placeholder="Any notes..." multiline numberOfLines={2} />

          <AppButton title="RECORD PAYMENT" onPress={handleSubmit} loading={submitting} fullWidth style={styles.btn} />

          {/* HISTORY SECTION */}
          <View style={styles.historyHeader}>
            <History size={16} color={Colors.textMuted} />
            <Text style={styles.historyTitle}>PAYMENT LOGS</Text>
          </View>

          {payments.length === 0 ? (
            <View style={styles.emptyLogs}>
              <Text style={styles.emptyLogsText}>NO PAYMENTS RECORDED YET</Text>
            </View>
          ) : (
            payments.map((p) => (
              <View key={p._id} style={styles.payLogCard}>
                <View style={styles.payLogLeft}>
                  <Text style={styles.payLogAmount}>+ {formatINR(p.amount)}</Text>
                  <Text style={styles.payLogMeta}>{p.mode.toUpperCase()} • {new Date(p.createdAt).toLocaleDateString()}</Text>
                  {!!p.note && <Text style={styles.payLogNote} numberOfLines={1}>{p.note}</Text>}
                </View>
                <TouchableOpacity 
                   style={styles.deleteBtn}
                   onPress={() => handleDeletePayment(p._id)}
                >
                  <Trash2 size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}

          {invoice?.amountDue > 0 && (
             <View style={styles.warningBox}>
                <AlertCircle size={14} color={Colors.warning} />
                <Text style={styles.warningText}>THIS BILL HAS OUTSTANDING DUES</Text>
             </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  invCard: { marginBottom: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  invId: { fontSize: 13, color: Colors.primary, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 1 },
  invDealer: { fontSize: 18, fontWeight: '800', color: Colors.white, marginTop: 4 },
  invTotal: { fontSize: 14, color: Colors.textMuted, marginTop: 4, fontWeight: '700' },
  dueBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  dueLabel: { fontSize: 11, color: Colors.danger, fontWeight: '800', letterSpacing: 1 },
  dueAmount: { fontSize: 28, fontWeight: '900', color: Colors.danger, marginTop: 4 },
  label: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, marginBottom: 8, letterSpacing: 1, marginTop: 12 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modeChip: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.surface },
  modeActive: { borderColor: Colors.primary, backgroundColor: Colors.black },
  modeText: { fontSize: 12, color: Colors.textMuted, fontWeight: '800' },
  modeTextActive: { color: Colors.primary },
  btn: { marginTop: 20 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 40, marginBottom: 16 },
  historyTitle: { fontSize: 10, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1.5 },
  emptyLogs: { padding: 32, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border },
  emptyLogsText: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  payLogCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: Colors.surface, 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  payLogLeft: { flex: 1 },
  payLogAmount: { fontSize: 15, fontWeight: '800', color: Colors.success },
  payLogMeta: { fontSize: 10, color: Colors.textMuted, marginTop: 2, fontWeight: '600' },
  payLogNote: { fontSize: 10, color: Colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)' },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 32, justifyContent: 'center' },
  warningText: { fontSize: 9, fontWeight: '800', color: Colors.warning, letterSpacing: 1 },
});
