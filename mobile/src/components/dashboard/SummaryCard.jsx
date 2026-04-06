import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppCard from '../common/AppCard';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function SummaryCard({ title, value, color = Colors.primary }) {
  return (
    <AppCard style={styles.card} shadow="sm">
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.title}>{title}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { 
    flex: 1, 
    minWidth: '45%', 
    padding: 20,
    backgroundColor: Colors.surface, // #121212
    borderWidth: 1.5,
    borderColor: Colors.border, // #2A2A2A
  },
  indicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 4,
  },
  title: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
