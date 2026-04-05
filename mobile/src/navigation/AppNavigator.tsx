import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuthStore } from '../store/authStore';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { DealerListScreen } from '../screens/Dealers/DealerListScreen';
import { ProductListScreen } from '../screens/Products/ProductListScreen';
import { MoreScreen } from '../screens/Dashboard/MoreScreen';
import { ActivityIndicator, View } from 'react-native';
import { billoTheme } from '../theme';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: billoTheme.colors.primary,
    background: billoTheme.colors.background,
    card: billoTheme.colors.surface,
    text: billoTheme.colors.onSurface,
  },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: billoTheme.colors.primary,
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, string> = {
            Dashboard: 'view-dashboard',
            Dealers: 'account-group',
            Products: 'notebook',
            More: 'cog',
          };
          return <Icon name={map[route.name] || 'circle'} size={size} color={color} />;
        },
      })}>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Dealers" component={DealerListScreen} />
      <Tabs.Screen name="Products" component={ProductListScreen} />
      <Tabs.Screen name="More" component={MoreScreen} />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { ready, signedIn, boot } = useAuthStore();

  useEffect(() => {
    boot();
  }, [boot]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={billoTheme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!signedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
