import { authService } from '@/services/auth.service';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(5, 'Password must be at least 5 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onLogin = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const loginResponse = await authService.login(data);
      if (loginResponse) {
        router.replace('/(tabs)');
      }
    } catch (e) {
      console.log(e);
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

      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ marginBottom: 6, color: '#374151' }}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
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
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text style={{ color: 'red' }}>{errors.email.message}</Text>
          )}
        </View>

        <View>
          <Text style={{ marginBottom: 6, color: '#374151' }}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                secureTextEntry
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
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text style={{ color: 'red' }}>{errors.password.message}</Text>
          )}
        </View>

        <Pressable
          onPress={handleSubmit(onLogin)}
          disabled={loading || !!errors.password || !!errors.email}
          style={{
            backgroundColor:
              !!errors.password || !!errors.email ? '#A7F3D0' : '#10B981',
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
