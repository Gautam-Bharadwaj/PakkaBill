import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Colors } from '../../theme/colors';

export default function AppLoader({ label = 'LOADING...', fullScreen = false }) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.loaderFrame}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
      {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.black,
    zIndex: 999,
  },
  loaderFrame: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  label: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
