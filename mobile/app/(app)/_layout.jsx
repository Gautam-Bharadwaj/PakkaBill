import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import useInvoiceStore from '../../src/store/useInvoiceStore';

export default function AppLayout() {
  const invoices = useInvoiceStore((s) => s.invoices);
  const unpaidCount = invoices.filter((inv) => inv.paymentStatus !== 'paid').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -4 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dealers"
        options={{
          title: 'Dealers',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Invoices',
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
          tabBarBadge: unpaidCount > 0 ? unpaidCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.danger, color: Colors.white, fontSize: 10 },
        }}
      />
    </Tabs>
  );
}
