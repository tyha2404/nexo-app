import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export const loginSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  password: yup
    .string()
    .min(5, 'Password must be at least 5 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // TODO: Replace with real auth API
      await new Promise((r) => setTimeout(r, 600));
      router.replace('/(tabs)');
    } catch (e) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 24 }}>
        Welcome back
      </Text>

      {!!error && (
        <Text style={{ color: '#DC2626', marginBottom: 12 }}>{error}</Text>
      )}

      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ marginBottom: 6, color: '#374151' }}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            style={{
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 10,
              color: '#111827',
            }}
          />
        </View>

        <View>
          <Text style={{ marginBottom: 6, color: '#374151' }}>Password</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            style={{
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 10,
              color: '#111827',
            }}
          />
        </View>

        <Pressable
          onPress={onLogin}
          disabled={loading || !email || !password}
          style={{
            backgroundColor: !email || !password ? '#A7F3D0' : '#10B981',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Log in</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
