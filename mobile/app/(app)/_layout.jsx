import { Tabs, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '../../src/theme/colors';
import useInvoiceStore from '../../src/store/useInvoiceStore';

// Custom Tab Bar Button for the "New Bill" action
const CenterButton = () => (
  <TouchableOpacity 
    style={styles.centerBtnContainer} 
    activeOpacity={0.8}
    onPress={() => router.push('/(app)/invoices/new')}
  >
    <View style={styles.centerBtn}>
      <Feather name="plus" size={24} color={Colors.black} />
    </View>
  </TouchableOpacity>
);

export default function AppLayout() {
  const invoices = useInvoiceStore((s) => s.invoices);
  const unpaidCount = invoices.filter((inv) => inv.paymentStatus !== 'paid').length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.black }}>
      <StatusBar barStyle="light-content" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.black,
            borderTopWidth: 2,
            borderTopColor: Colors.border,
            height: Platform.OS === 'ios' ? 88 : 72, 
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 10,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: { 
            fontSize: 8, 
            fontWeight: '900', 
            marginTop: -4,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard/index"
          options={{
            title: 'COMMAND',
            tabBarIcon: ({ color }) => <Feather name="activity" size={18} color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="invoices/index"
          options={{
            title: 'BILLS',
            tabBarIcon: ({ color }) => <Feather name="layers" size={18} color={color} />,
            tabBarBadge: unpaidCount > 0 ? unpaidCount : undefined,
            tabBarBadgeStyle: { backgroundColor: Colors.primary, color: Colors.black, fontSize: 10, fontWeight: '900' },
          }}
        />

        <Tabs.Screen
          name="invoices/new"
          options={{
            title: '',
            tabBarButton: () => <CenterButton />,
            tabBarStyle: { display: 'none' }, // Hides bar on New Bill screen
          }}
        />

        <Tabs.Screen
          name="products/index"
          options={{
            title: 'STOCK',
            tabBarIcon: ({ color }) => <Feather name="box" size={18} color={color} />,
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'CONSOLE',
            tabBarIcon: ({ color }) => <Feather name="settings" size={18} color={color} />,
          }}
        />
        
        {/* Href: Null screens (Internal) */}
        <Tabs.Screen name="dealers/index" options={{ href: null }} />
        <Tabs.Screen name="dealers/add" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="dealers/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="invoices/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="dashboard/insights" options={{ href: null }} />
        <Tabs.Screen name="payments/index" options={{ href: null }} />
        <Tabs.Screen name="products/add" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  centerBtnContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.black, 
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
