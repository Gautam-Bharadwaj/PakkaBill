import React from 'react';
import { Tabs, router } from 'expo-router';
import { Home, Layers, Package, Settings, Plus } from 'lucide-react-native';
import { View, TouchableOpacity, Text, StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { Colors } from '../../src/theme/colors';
import useInvoiceStore from '../../src/store/useInvoiceStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IconMap = {
  home: Home,
  layers: Layers,
  box: Package,
  settings: Settings,
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const invoices = useInvoiceStore((s) => s.invoices);
  const unpaidCount = React.useMemo(() => 
    invoices.filter((inv) => inv.paymentStatus !== 'paid').length, 
    [invoices]
  );

  const currentRoute = state.routes[state.index].name;
  
  // 🧩 HIDE TAB BAR on Transactional/Detail Screens
  const hideOn = ['invoices/new', 'invoices/[id]', 'dealers/add', 'dealers/[id]', 'products/add', 'settings/change-pin'];
  const shouldHide = hideOn.some(route => currentRoute.includes(route));
  
  if (shouldHide) return null;

  const tabConfig = [
    { name: 'dashboard/index', label: 'DASHBOARD', icon: 'home' },
    { name: 'invoices/index', label: 'BILLS', icon: 'layers', badge: unpaidCount },
    { name: 'NEW_BILL' }, // Center FAB
    { name: 'products/index', label: 'STOCK', icon: 'box' },
    { name: 'settings', label: 'CONSOLE', icon: 'settings' },
  ];

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabBar}>
        {tabConfig.map((tab, index) => {
          if (tab.name === 'NEW_BILL') {
            return (
              <TouchableOpacity 
                key="fab"
                activeOpacity={0.9}
                onPress={() => router.push('/(app)/invoices/new')}
                style={styles.fabContainer}
              >
                <View style={styles.fab}>
                   <Plus size={32} color={Colors.black} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          }

          const route = state.routes.find(r => r.name === tab.name);
          const isFocused = state.index === state.routes.indexOf(route);
          
          const color = isFocused ? Colors.primary : Colors.textSecondary;
          const Icon = IconMap[tab.icon];

          const onPress = () => {
            const event = navigation.emit({ 
              type: 'tabPress', 
              target: route?.key, 
              canPreventDefault: true 
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Icon size={22} color={color} strokeWidth={isFocused ? 2.5 : 2} />
                {tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive, { color }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function AppLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      >
        <Tabs.Screen name="dashboard/index" />
        <Tabs.Screen name="invoices/index" />
        <Tabs.Screen name="products/index" />
        <Tabs.Screen name="settings" />
        
        <Tabs.Screen name="dealers/index" />
        <Tabs.Screen name="dealers/add" />
        <Tabs.Screen name="dealers/[id]" />
        <Tabs.Screen name="dealers/[id]/edit" />
        <Tabs.Screen name="dealers/[id]/history" />
        <Tabs.Screen name="invoices/[id]" />
        <Tabs.Screen name="invoices/new" />
        <Tabs.Screen name="dashboard/insights" />
        <Tabs.Screen name="payments/[invoiceId]" />
        <Tabs.Screen name="payments/qr/[invoiceId]" />
        <Tabs.Screen name="products/add" />
        <Tabs.Screen name="products/[id]/edit" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 0.9,
    height: 76,
    backgroundColor: 'rgba(5, 5, 5, 0.98)', 
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1.5,
    borderColor: '#0F0F0F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrap: {
    marginBottom: 6,
    position: 'relative',
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    fontWeight: '900',
  },
  fabContainer: {
    top: -28,
    width: 68,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(28, 28, 30, 1)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  badge: {
    position: 'absolute',
    right: -12,
    top: -10,
    backgroundColor: '#FF3333',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: Colors.white,
  },
});
