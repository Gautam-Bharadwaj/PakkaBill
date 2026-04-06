import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Share, Dimensions, StatusBar, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';
import useInvoiceStore from '../../../src/store/useInvoiceStore';
import AppHeader from '../../../src/components/common/AppHeader';
import AppLoader from '../../../src/components/common/AppLoader';
import AppError from '../../../src/components/common/AppError';
import AppButton from '../../../src/components/common/AppButton';
import { Colors } from '../../../src/theme/colors';
import { Typography } from '../../../src/theme/typography';
import { Spacing, Radius, Shadow } from '../../../src/theme/spacing';
import { formatINR } from '../../../src/utils/currency';
import { formatDate } from '../../../src/utils/date';
import { getInvoicePdfUrl } from '../../../src/api/invoice.api';
import { openWhatsApp, buildInvoiceMessage } from '../../../src/utils/whatsapp';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { currentInvoice: invoice, isLoading, error, fetchInvoice } = useInvoiceStore();

  useEffect(() => {
    fetchInvoice(id);
  }, [id]);

  if (isLoading || !invoice) return <AppLoader fullScreen label="Finalizing Receipt Details..." />;
  if (error) return <AppError message={error} onRetry={() => fetchInvoice(id)} />;

  const handleWhatsApp = () => {
    const message = buildInvoiceMessage(invoice);
    openWhatsApp(invoice.dealerPhone, message);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: buildInvoiceMessage(invoice),
        url: getInvoicePdfUrl(id),
        title: `Bill ${invoice.invoiceId}`,
      });
    } catch (err) {
      showMessage({ message: 'Sharing failed', type: 'danger' });
    }
  };

  const handlePDF = () => Linking.openURL(`${getInvoicePdfUrl(id)}`);

  const RightAction = (
    <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
      <Feather name="share-2" size={20} color={Colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      
      {/* Normalized Top Navbar */}
      <AppHeader 
        title="BILL PREVIEW" 
        showBack={true} 
        onBack={() => router.back()} 
        rightAction={RightAction}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Industrial Receipt */}
        <View style={styles.receiptContainer}>
          <View style={styles.receiptBody}>
            {/* Business Header */}
            <View style={styles.receiptHeader}>
              <View style={styles.logoBadge}>
                <Feather name="zap" size={32} color={Colors.black} />
              </View>
              <Text style={styles.businessName}>PAKKABILL CORP</Text>
              <Text style={styles.businessSubs}>SECURE TRANSACTION RECORD</Text>
            </View>

            <View style={styles.thickDivider} />

            {/* Meta Section */}
            <View style={styles.metaBox}>
              <View>
                <Text style={styles.metaLabel}>INVOICE ID</Text>
                <Text style={styles.metaValue}>#{invoice.invoiceId.split('-').pop()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>TIMESTAMP</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.createdAt, 'dd MMM yyyy • hh:mm a')}</Text>
              </View>
            </View>

            <View style={styles.dashedDivider} />

            {/* Itemized Table */}
            <View style={styles.table}>
               <View style={styles.tableHead}>
                 <Text style={[styles.headText, { flex: 2 }]}>SKU / PRODUCT</Text>
                 <Text style={[styles.headText, { flex: 0.5, textAlign: 'center' }]}>QTY</Text>
                 <Text style={[styles.headText, { flex: 1.5, textAlign: 'right' }]}>TOTAL</Text>
               </View>
               {invoice.lineItems?.map((item, i) => (
                 <View key={i} style={styles.tableRow}>
                   <Text style={[styles.rowName, { flex: 2 }]} numberOfLines={2}>{item.productName}</Text>
                   <Text style={[styles.rowQty, { flex: 0.5, textAlign: 'center' }]}>{item.quantity}</Text>
                   <Text style={[styles.rowPrice, { flex: 1.5, textAlign: 'right' }]}>{formatINR(item.lineTotal)}</Text>
                 </View>
               ))}
            </View>

            <View style={styles.dashedDivider} />

            {/* Bill Summary */}
            <View style={styles.summaryBox}>
               <View style={styles.summaryItem}>
                 <Text style={styles.sumLabel}>SUBTOTAL</Text>
                 <Text style={styles.sumValue}>{formatINR(invoice.subtotal)}</Text>
               </View>
               {invoice.gstAmount > 0 && (
                 <View style={styles.summaryItem}>
                   <Text style={styles.sumLabel}>GST (18%)</Text>
                   <Text style={styles.sumValue}>{formatINR(invoice.gstAmount)}</Text>
                 </View>
               )}
               <View style={styles.grandTotal}>
                 <Text style={styles.grandLabel}>GRAND TOTAL</Text>
                 <Text style={styles.grandValue}>{formatINR(invoice.totalAmount)}</Text>
               </View>
            </View>

            <View style={styles.zigzagBorder}>
               {Array.from({ length: 14 }).map((_, i) => (
                 <View key={i} style={styles.zig} />
               ))}
            </View>
          </View>
        </View>

        {/* Action Panel */}
        <View style={styles.actionPanel}>
           <TouchableOpacity 
             style={styles.actionSecondary} 
             onPress={handlePDF}
           >
              <Feather name="file-text" size={18} color={Colors.white} />
              <Text style={styles.actionSecText}>DOWNLOAD PDF</Text>
           </TouchableOpacity>
           
           <TouchableOpacity 
             style={styles.actionPrimary} 
             onPress={handleWhatsApp}
           >
              <FontAwesome name="whatsapp" size={24} color={Colors.black} />
              <Text style={styles.actionPriText}>WHATSAPP SHARE</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  shareBtn: { padding: 4 },
  content: { padding: 24, paddingBottom: 60 },
  receiptContainer: {
    width: '100%',
    ...Shadow.lg,
  },
  receiptBody: {
    backgroundColor: Colors.surface, 
    borderRadius: 2, 
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    transform: [{ rotate: '45deg' }],
  },
  businessName: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: 2 },
  businessSubs: { fontSize: 8, color: Colors.primary, fontWeight: '900', letterSpacing: 2.5, marginTop: 8 },
  thickDivider: { height: 4, backgroundColor: Colors.primary, marginVertical: 20, borderRadius: 2 },
  metaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaLabel: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, marginBottom: 4, letterSpacing: 1.5 },
  metaValue: { fontSize: 12, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  dashedDivider: { height: 1, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', marginVertical: 20 },
  table: { marginBottom: 12 },
  tableHead: { flexDirection: 'row', paddingBottom: 12 },
  headText: { fontSize: 8, fontWeight: '900', color: Colors.textMuted, letterSpacing: 1.5 },
  tableRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  rowName: { fontSize: 13, fontWeight: '700', color: Colors.white },
  rowQty: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },
  rowPrice: { fontSize: 13, color: Colors.primary, fontWeight: '900' },
  summaryBox: { marginTop: 12 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '800', letterSpacing: 1.5 },
  sumValue: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  grandLabel: { fontSize: 16, fontWeight: '900', color: Colors.white, letterSpacing: 1.5 },
  grandValue: { fontSize: 24, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  zigzagBorder: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    opacity: 0.2,
  },
  zig: {
    width: 14,
    height: 14,
    backgroundColor: Colors.border,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 4,
  },
  actionPanel: { marginTop: 40, gap: 16 },
  actionPrimary: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     height: 56,
     borderRadius: Radius.md,
     backgroundColor: Colors.primary,
  },
  actionPriText: { color: Colors.black, fontWeight: '900', marginLeft: 12, fontSize: 14, letterSpacing: 1.5 },
  actionSecondary: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     height: 56,
     borderRadius: Radius.md,
     borderWidth: 1.5,
     borderColor: Colors.border,
     backgroundColor: Colors.surface,
  },
  actionSecText: { color: Colors.white, fontWeight: '800', marginLeft: 12, fontSize: 14, letterSpacing: 1.5 },
});
