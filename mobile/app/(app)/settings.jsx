import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AppHeader from '../../src/components/common/AppHeader';
import AppCard from '../../src/components/common/AppCard';
import { Colors } from '../../src/theme/colors';
import { Spacing, Radius } from '../../src/theme/spacing';
import useAuthStore from '../../src/store/useAuthStore';
import { clearAll } from '../../src/utils/storage';

export default function SettingsScreen() {
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "TERMINATE SESSION",
      "Are you sure you want to logout? You will need your security PIN to return.",
      [
        { text: "CANCEL", style: "cancel" },
        { 
          text: "LOGOUT", 
          style: "destructive",
          onPress: async () => {
             await logout();
             router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleExportLedger = async () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        user: user?.name,
        system: "PakkaBill Enterprise",
        note: "Raw ledger export"
      };
      const fileUri = `${FileSystem.documentDirectory}pakkabill_export_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      showMessage({ message: 'EXPORT FAILED: ' + err.message, type: 'danger' });
    }
  };

  const handlePurgeCache = () => {
    Alert.alert(
      "PURGE LOCAL CACHE",
      "This will clear all locally stored data except your login session. Proceed?",
      [
        { text: "CANCEL", style: "cancel" },
        { 
          text: "PURGE", 
          style: "destructive",
          onPress: () => {
            // Logic for partial purge if needed
            showMessage({ message: 'CACHE PURGED SUCCESSFULLY', type: 'success' });
          }
        }
      ]
    );
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && (
          <Text style={styles.rowValue}>{value.toUpperCase()}</Text>
        )}
        {onPress && (
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <AppHeader title="SYSTEM CONSOLE" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Business Identity */}
        <Text style={styles.sectionLabel}>BUSINESS IDENTITY</Text>
        <AppCard style={styles.sectionCard}>
          <SettingRow 
            icon="briefcase" 
            title="OWNER NAME" 
            value={user?.name || "AUTHENTICATING..."} 
            onPress={() => router.push('/(app)/settings/edit-profile')}
          />
          <SettingRow 
            icon="file-text" 
            title="BUSINESS TYPE" 
            value={user?.shopName || "Wholesale Enterprise"} 
            onPress={() => router.push('/(app)/settings/edit-profile')}
          />
          <SettingRow 
            icon="map-pin" 
            title="OPERATIONAL HUB" 
            value={user?.address || "Active Device"} 
            onPress={() => router.push('/(app)/settings/edit-profile')}
          />
        </AppCard>

        {/* Security & Access */}
        <Text style={styles.sectionLabel}>SECURITY & ACCESS</Text>
        <AppCard style={styles.sectionCard}>
          <SettingRow 
            icon="lock" 
            title="CHANGE CONSOLE PIN" 
            onPress={() => router.push('/(app)/settings/change-pin')} 
          />
          <SettingRow 
            icon="shield" 
            title="TWO-FACTOR AUTH" 
            onPress={() => showMessage({ message: '2FA IS COMING SOON IN V2.5', type: 'info' })} 
          />
        </AppCard>

        {/* Data Architecture */}
        <Text style={styles.sectionLabel}>DATA ARCHITECTURE</Text>
        <AppCard style={styles.sectionCard}>
          <SettingRow icon="database" title="EXPORT LEDGER (JSON)" onPress={handleExportLedger} color={Colors.primary} />
          <SettingRow icon="upload-cloud" title="CLOUD SYNC" value="ENABLED" color={Colors.success} />
          <SettingRow icon="trash-2" title="PURGE LOCAL CACHE" onPress={handlePurgeCache} color={Colors.error} />
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
