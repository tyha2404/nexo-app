import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_LOCAL_STORAGE } from '@/services/auth.service';

export default function Entry() {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await AsyncStorage.getItem(USER_LOCAL_STORAGE);
        if (!mounted) return;
        setAuthed(!!user);
      } catch {
        if (!mounted) return;
        setAuthed(false);
      } finally {
        if (mounted) setChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!checked) return null;
  return authed ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
