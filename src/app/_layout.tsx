import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AppSplashScreen from '@/components/SplashScreen';

export default function RootLayout() {
  const isFrameworkReady = useFrameworkReady();

  return (
    <>
      <AppSplashScreen isFrameworkReady={isFrameworkReady} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
