import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

export default function ConfirmModal({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmLabel = "DELETE",
  isDanger = true 
}) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconFrame, isDanger && styles.dangerIconFrame]}>
            <AlertTriangle size={32} color={isDanger ? Colors.danger : Colors.primary} strokeWidth={2.5} />
          </View>

          <Text style={styles.title}>{title.toUpperCase()}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>GO BACK</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.confirmBtn, isDanger && styles.dangerBtn]} 
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeIcon} onPress={onCancel}>
            <X size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  iconFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dangerIconFrame: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.black,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  confirmBtn: {
    flex: 1.5,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerBtn: {
    backgroundColor: Colors.danger,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 4,
  },
});
