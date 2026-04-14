import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Colors } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function IntroScreen() {
  const hindiScale = useSharedValue(0);
  const englishScale = useSharedValue(0);
  const hindiOpacity = useSharedValue(0);
  const englishOpacity = useSharedValue(0);
  const containerScale = useSharedValue(1);

  const onFinish = () => {
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    // Animation Sequence
    hindiScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    hindiOpacity.value = withTiming(1, { duration: 600 });

    englishScale.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) }));
    englishOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // Zoom out and navigate
    containerScale.value = withDelay(2500, withTiming(1.2, { duration: 800 }, (finished) => {
      if (finished) {
        runOnJS(onFinish)();
      }
    }));
  }, []);

  const hindiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hindiScale.value }],
    opacity: hindiOpacity.value,
  }));

  const englishStyle = useAnimatedStyle(() => ({
    transform: [{ scale: englishScale.value }],
    opacity: englishOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />
      <Animated.View style={[styles.content, containerStyle]}>
        <View style={styles.textRow}>
          <Animated.Text style={[styles.hindi, hindiStyle]}>पक्का</Animated.Text>
          <Animated.Text style={[styles.english, englishStyle]}>BILL</Animated.Text>
        </View>
        <View style={styles.underline} />
      </Animated.View>
      
      <Text style={styles.footer}>PREMIUM BILLING SYSTEM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hindi: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -2,
  },
  english: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.primary,
    marginLeft: 10,
    letterSpacing: 2,
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: Colors.primary,
    marginTop: 10,
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 5,
  },
});
