import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import useAuthStore from '../src/store/useAuthStore';
import { Colors } from '../src/theme/colors';

export default function Index() {
  const { isAuthenticated, isStorageLoaded } = useAuthStore();
  
  if (!isStorageLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) return <Redirect href="/(app)/dashboard" />;
  return <Redirect href="/(auth)/login" />;
}
