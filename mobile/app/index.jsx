import { Redirect } from 'expo-router';
import useAuthStore from '../src/store/useAuthStore';

export default function Index() {
  const { isAuthenticated, hasRegistered } = useAuthStore();
  
  if (isAuthenticated) return <Redirect href="/(app)/dashboard" />;
  if (hasRegistered) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(auth)/signup" />;
}
