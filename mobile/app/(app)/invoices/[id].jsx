import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, Share, Dimensions, StatusBar, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Share2, Zap, RotateCw, FileText, PlusCircle } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
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

  const handleReorder = () => {
    router.push({
      pathname: '/(app)/invoices/new',
      params: { 
        dealerId: invoice.dealerId,
        reorderId: id 
      }
    });
  };

  const handlePDF = () => Linking.openURL(`${getInvoicePdfUrl(id)}`);

  const RightAction = (
    <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
      <Share2 size={20} color={Colors.primary} strokeWidth={2} />
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
                <Zap size={32} color={Colors.black} strokeWidth={2.5} fill={Colors.black} />
              </View>
              <Text style={styles.businessName}>PAKKABILL CORP</Text>
              <Text style={styles.businessSubs}>OFFICIAL BILL RECEIPT</Text>
            </View>

            <View style={styles.thickDivider} />

            {/* Meta Section */}
            <View style={styles.metaBox}>
              <View>
                <Text style={styles.metaLabel}>BILL NO</Text>
                <Text style={styles.metaValue}>#{invoice.invoiceId.split('-').pop()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>DATE & TIME</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.createdAt, 'dd MMM yyyy • hh:mm a')}</Text>
              </View>
            </View>

            <View style={styles.dashedDivider} />

            {/* Itemized Table */}
            <View style={styles.table}>
               <View style={styles.tableHead}>
                 <Text style={[styles.headText, { flex: 2 }]}>ITEM NAME</Text>
                 <Text style={[styles.headText, { flex: 0.5, textAlign: 'center' }]}>QTY</Text>
                 <Text style={[styles.headText, { flex: 1.5, textAlign: 'right' }]}>PRICE</Text>
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
                 <Text style={styles.grandLabel}>FINAL AMOUNT</Text>
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
              style={styles.actionReorder} 
              onPress={handleReorder}
            >
               <RotateCw size={18} color={Colors.primary} strokeWidth={2} />
               <Text style={styles.actionReorderText}>MAKE THIS BILL AGAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionPrimary} 
              onPress={() => router.push('/(app)/invoices/new')}
            >
               <PlusCircle size={22} color={Colors.black} strokeWidth={2.5} />
               <Text style={styles.actionPriText}>CREATE ANOTHER BILL</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.actionSecondary, { flex: 1 }]} 
                  onPress={handlePDF}
                >
                   <FileText size={18} color={Colors.white} strokeWidth={2} />
                   <Text style={[styles.actionSecText, { fontSize: 13 }]}>PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionWhatsApp, { flex: 1 }]} 
                  onPress={handleWhatsApp}
                >
                   <FontAwesome name="whatsapp" size={22} color={Colors.black} />
                   <Text style={[styles.actionPriText, { fontSize: 13 }]}>WHATSAPP</Text>
                </TouchableOpacity>
            </View>
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
  },
  receiptBody: {
    backgroundColor: Colors.surface, 
    borderRadius: 24, 
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  businessName: { fontSize: 20, fontWeight: '700', color: Colors.white, letterSpacing: 1 },
  businessSubs: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 1, marginTop: 4 },
  thickDivider: { height: 2, backgroundColor: Colors.primary, marginVertical: 20, borderRadius: 2 },
  metaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaLabel: { fontSize: 9, fontWeight: '600', color: Colors.textMuted, marginBottom: 4, letterSpacing: 0.5 },
  metaValue: { fontSize: 13, fontWeight: '700', color: Colors.white },
  dashedDivider: { height: 1, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', marginVertical: 20 },
  table: { marginBottom: 12 },
  tableHead: { flexDirection: 'row', paddingBottom: 12 },
  headText: { fontSize: 9, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  rowName: { fontSize: 14, fontWeight: '600', color: Colors.white },
  rowQty: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  rowPrice: { fontSize: 14, color: Colors.white, fontWeight: '700' },
  summaryBox: { marginTop: 12 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sumLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  sumValue: { fontSize: 12, color: Colors.white, fontWeight: '700' },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  grandLabel: { fontSize: 16, fontWeight: '700', color: Colors.white },
  grandValue: { fontSize: 22, fontWeight: '700', color: Colors.primaryLight },
  zigzagBorder: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    opacity: 0.1,
  },
  zig: {
    width: 12,
    height: 12,
    backgroundColor: Colors.textMuted,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionPanel: { marginTop: 40, gap: 16 },
  actionPrimary: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     height: 56,
     borderRadius: 16,
     backgroundColor: Colors.primary,
  },
  actionPriText: { color: Colors.white, fontWeight: '700', marginLeft: 12, fontSize: 15 },
  actionReorder: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     height: 56,
     borderRadius: 16,
     borderWidth: 1.5,
     borderColor: Colors.primary,
     backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  actionReorderText: { color: Colors.primaryLight, fontWeight: '700', marginLeft: 12, fontSize: 15 },
  actionSecondary: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     height: 56,
     borderRadius: 16,
     borderWidth: 1.5,
     borderColor: Colors.border,
     backgroundColor: Colors.surface,
  },
  actionSecText: { color: Colors.white, fontWeight: '600', marginLeft: 12, fontSize: 15 },
  buttonRow: { flexDirection: 'row', gap: 16 },
  actionWhatsApp: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     height: 56,
     borderRadius: 16,
     backgroundColor: '#25D366', // WhatsApp Brand Color
  },
});
