import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking, Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import AppLoader from '../../../../src/components/common/AppLoader';
import AppButton from '../../../../src/components/common/AppButton';
import { Colors } from '../../../../src/theme/colors';
import { Typography } from '../../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../../src/theme/spacing';
import { formatINR } from '../../../../src/utils/currency';
import { getPaymentQR } from '../../../../src/api/payment.api';
import logger from '../../../../src/utils/logger';

export default function UPIQRScreen() {
  const { invoiceId } = useLocalSearchParams();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getPaymentQR(invoiceId);
        setQrData(data.data);
      } catch (err) {
        logger.error('[QR] fetch failed', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [invoiceId]);

  if (loading) return <AppLoader fullScreen label="Generating QR..." />;
  if (!qrData) return null;

  const { upiLink, upiVpa, upiName, amount, invoiceId: invId } = qrData;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>

        <Text style={styles.invoiceId}>{invId}</Text>
        <Text style={styles.heading}>Scan to Pay</Text>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={upiLink}
            size={260}
            color={Colors.primary}
            backgroundColor={Colors.white}
            logo={undefined}
          />
        </View>

        {/* Payment details */}
        <View style={styles.details}>
          <Text style={styles.detailLabel}>UPI ID</Text>
          <Text style={styles.detailValue}>{upiVpa}</Text>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.amountBig}>{formatINR(amount)}</Text>
          <Text style={styles.detailLabel}>Invoice</Text>
          <Text style={styles.detailValue}>{invId}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <AppButton
            title="Open in UPI App"
            onPress={() => Linking.openURL(upiLink)}
            fullWidth
            style={styles.btn}
          />
          <AppButton
            title="Share QR"
            onPress={() => Share.share({ message: `Pay ${formatINR(amount)} via UPI: ${upiLink}` })}
            variant="secondary"
            fullWidth
            style={styles.btn}
          />
          <AppButton
            title="Send via WhatsApp"
            onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`Pay ${formatINR(amount)} for Invoice ${invId}: ${upiLink}`)}`)}
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  content: { alignItems: 'center', padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  back: { alignSelf: 'flex-start', color: Colors.primary, fontWeight: Typography.fontWeight.semibold, marginBottom: Spacing.lg },
  invoiceId: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, fontFamily: 'monospace', marginBottom: Spacing.xs },
  heading: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.text, marginBottom: Spacing['2xl'] },
  qrContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    ...Shadow.lg,
    marginBottom: Spacing['2xl'],
  },
  details: { alignItems: 'center', marginBottom: Spacing['2xl'], width: '100%' },
  detailLabel: { fontSize: Typography.fontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: Spacing.md },
  detailValue: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.text, marginTop: 2 },
  amountBig: { fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.primary, marginTop: 2 },
  buttons: { width: '100%', gap: Spacing.sm },
  btn: { marginBottom: 0 },
});
