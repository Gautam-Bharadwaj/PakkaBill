import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, Shadow } from '../../theme/spacing';

export default function AppCard({ children, style, padded = true, shadow = 'sm' }) {
  return (
    <View style={[
      styles.card, 
      shadow && Shadow[shadow], 
      padded && styles.padded, 
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, // #121212 per Carbon Dark
    borderRadius: Radius.lg, // 20px
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border, // #2A2A2A for industrial feel
  },
  padded: {
    padding: Spacing.base, // 16px
  },
});
