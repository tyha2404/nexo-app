import { authService } from '@/services/auth.service';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FormInput, FormPasswordInput } from '@/components/ui/form';
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
    formState: { errors, isValid },
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
        <FormInput
          name="email"
          control={control}
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />

        <FormPasswordInput
          name="password"
          control={control}
          label="Password"
          placeholder="••••••••"
          required
        />

        <Pressable
          onPress={handleSubmit(onLogin)}
          disabled={loading || !isValid}
          style={{
            backgroundColor: !isValid ? '#A7F3D0' : '#10B981',
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
