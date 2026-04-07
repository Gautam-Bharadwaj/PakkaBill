import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Database, PackageOpen, Inbox } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import AppButton from './AppButton';

export default function AppEmpty({ 
  title = 'NO DATA FOUND', 
  subtitle, 
  actionLabel, 
  onAction,
  icon = 'database' 
}) {
  const Icon = icon === 'package' ? PackageOpen : icon === 'inbox' ? Inbox : Database;

  return (
    <View style={styles.container}>
      <View style={styles.iconFrame}>
        <Icon size={32} color={Colors.textMuted} strokeWidth={1} />
      </View>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text>}
      {!!(actionLabel && onAction) && (
        <AppButton 
          title={actionLabel.toUpperCase()} 
          onPress={onAction} 
          style={styles.btn} 
          size="sm"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 32,
    marginTop: 40,
  },
  iconFrame: { 
    width: 80, 
    height: 80, 
    backgroundColor: Colors.surface, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
    width: '80%',
    lineHeight: 16,
  },
  btn: { 
    marginTop: 32, 
    minWidth: 180,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
});
