import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { getGstSuggestion } from '../../api/ai.api';

export default function AiGstSuggestion({ lineItems, onSuggestGst }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const handleSuggest = async () => {
    if (!lineItems || lineItems.length === 0) return;
    setLoading(true);
    try {
      // Use the first item's name to get a suggestion
      const itemToCheck = lineItems[0].productName;
      const { data } = await getGstSuggestion(itemToCheck);
      const res = data.data; // { hsnCode, gstRate, category }
      setSuggestion(res);
      if (res && res.gstRate !== undefined) {
        onSuggestGst(res.gstRate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (lineItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Sparkles size={16} color={Colors.primary} />
        <Text style={styles.title}>AI GST SUGGESTION</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing items...</Text>
        </View>
      ) : suggestion ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            Suggested Rate: <Text style={styles.bold}>{suggestion.gstRate}%</Text>
          </Text>
          <Text style={styles.resultSub}>
            HSN Code: {suggestion.hsnCode} • Category: {suggestion.category}
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.btn} onPress={handleSuggest}>
          <Text style={styles.btnText}>Auto-detect GST Rate</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1100', // Deep primary tinted background
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  btn: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  btnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: Colors.primary,
    fontSize: 12,
  },
  resultBox: {
    marginTop: 4,
  },
  resultText: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  resultSub: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
