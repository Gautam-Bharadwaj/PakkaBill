import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, X } from 'lucide-react-native';
import useAiStore from '../../store/useAiStore';
import { Colors } from '../../theme/colors';

export default function AiInsightCard() {
  const { insights, isLoadingInsights, fetchInsights } = useAiStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    if (insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
      }, 5000); // Rotate every 5 secs
      return () => clearInterval(interval);
    }
  }, [insights]);

  if (!isVisible || isLoadingInsights || insights.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Sparkles size={16} color={Colors.primary} style={styles.icon} />
          <Text style={styles.title}>AI INSIGHTS</Text>
        </View>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <X size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.insightText}>{insights[currentIndex]}</Text>
      </View>
      {insights.length > 1 && (
        <View style={styles.dotsRow}>
          {insights.map((_, i) => (
            <View 
              key={i} 
              style={[styles.dot, i === currentIndex && styles.activeDot]} 
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 0, 0.3)', // Subtle primary glow
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    minHeight: 40,
    justifyContent: 'center',
  },
  insightText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 14,
  },
});
