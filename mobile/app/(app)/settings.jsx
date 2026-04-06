import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import AppHeader from '../../../src/components/common/AppHeader';
import AppCard from '../../../src/components/common/AppCard';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radius } from '../../../src/theme/spacing';
import useAuthStore from '../../../src/store/useAuthStore';

export default function SettingsScreen() {
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
    showMessage({ message: 'LOGGED OUT FROM CONSOLE', type: 'info' });
  };

  const SettingRow = ({ icon, title, value, onPress, color = Colors.white }) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      activeOpacity={0.7} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconFrame, { borderColor: color }]}>
          <Feather name={icon} size={16} color={color} />
        </View>
        <Text style={styles.rowTitle}>{title.toUpperCase()}</Text>
      </View>
      {value ? (
        <Text style={styles.rowValue}>{value.toUpperCase()}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={18} color={Colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="SYSTEM CONSOLE" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Business Identity */}
        <Text style={styles.sectionLabel}>BUSINESS IDENTITY</Text>
        <AppCard style={styles.sectionCard}>
          <SettingRow icon="briefcase" title="SHOP NAME" value="PAAKABILL STATIONERY" />
          <SettingRow icon="file-text" title="GST NUMBER" value="27ABCDE1234F1Z5" />
          <SettingRow icon="map-pin" title="LOCATION" value="MUMBAI, MH" />
        </AppCard>

        {/* Security & Access */}
        <Text style={styles.sectionLabel}>SECURITY & ACCESS</Text>
        <AppCard style={styles.sectionCard}>
          <SettingRow icon="lock" title="CHANGE CONSOLE PIN" onPress={() => {}} />
          <SettingRow icon="shield" title="TWO-FACTOR AUTH" onPress={() => {}} />
        </AppCard>

        {/* Data Architecture */}
        <Text style={styles.sectionLabel}>DATA ARCHITECTURE</Text>
        <AppCard style={styles.sectionCard}>
          <SettingRow icon="database" title="EXPORT LEDGER (JSON)" onPress={() => {}} color={Colors.primary} />
          <SettingRow icon="upload-cloud" title="CLOUD SYNC" value="ENABLED" color={Colors.success} />
          <SettingRow icon="trash-2" title="PURGE LOCAL CACHE" onPress={() => {}} color={Colors.error} />
        </AppCard>

        {/* About & Support */}
        <Text style={styles.sectionLabel}>ENGINEERING & SUPPORT</Text>
        <AppCard style={styles.sectionCard}>
          <SettingRow icon="cpu" title="VERSION" value="2.4.0-CARBON" />
          <SettingRow icon="github" title="SOURCE REPOSITORY" onPress={() => Linking.openURL('https://github.com/Gautam-Bharadwaj/PakkaBill')} />
          <SettingRow icon="info" title="LICENSE" value="ENTERPRISE" />
        </AppCard>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: Colors.textMuted, letterSpacing: 2, marginBottom: 12, marginTop: 12 },
  sectionCard: { backgroundColor: Colors.surface, padding: 0, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 24, overflow: 'hidden' },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconFrame: { 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    backgroundColor: Colors.black, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 16,
  },
  rowTitle: { fontSize: 11, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  rowValue: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.5 },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    backgroundColor: 'rgba(255, 51, 51, 0.05)', 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255, 51, 51, 0.2)',
    marginTop: 12,
  },
  logoutText: { color: Colors.error, fontWeight: '900', fontSize: 12, marginLeft: 12, letterSpacing: 2 },
});
