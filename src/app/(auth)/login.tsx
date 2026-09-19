import { authService } from '@/services/auth.service';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FormInput, FormPasswordInput } from '@/components/ui/form';
import * as yup from 'yup';

export const loginSchema = yup.object({
  identifier: yup
    .string()
    .required('Tên đăng nhập hoặc Email không được để trống'),
  password: yup
    .string()
    .min(5, 'Mật khẩu phải có ít nhất 5 ký tự')
    .required('Mật khẩu không được để trống'),
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

  const onLogin = async (data: { identifier: string; password: string }) => {
    setLoading(true);
    try {
      const isEmail = data.identifier.includes('@');
      const loginResponse = await authService.login({
        username: !isEmail ? data.identifier : undefined,
        email: isEmail ? data.identifier : undefined,
        password: data.password,
      });
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
          name="identifier"
          control={control}
          label="Tên đăng nhập hoặc Email"
          placeholder="Nhập username hoặc email"
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 10,
          }}
        >
          {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
            {loading ? 'Logging in...' : 'Log in'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
