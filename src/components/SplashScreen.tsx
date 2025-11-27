import React, { useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';

interface AppSplashScreenProps {
  isFrameworkReady: boolean;
}

export default function AppSplashScreen({
  isFrameworkReady,
}: AppSplashScreenProps) {
  useEffect(() => {
    if (isFrameworkReady) {
      // Hide the splash screen once the framework is ready
      ExpoSplashScreen.hideAsync();
    }
  }, [isFrameworkReady]);

  // This component doesn't render anything visible
  // The splash screen is handled by expo-splash-screen
  return <></>;
}
