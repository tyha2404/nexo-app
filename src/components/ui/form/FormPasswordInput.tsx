import React, { useState } from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { FormPasswordInputProps } from './types';

export function FormPasswordInput<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  error,
  required = false,
  disabled = false,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  ...textInputProps
}: FormPasswordInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  const renderLabel = () => {
    if (!label) return null;

    return (
      <Text
        style={[
          {
            marginBottom: 6,
            color: '#374151',
            fontSize: 14,
            fontWeight: '500',
          },
          labelStyle,
        ]}
      >
        {label}
        {required && <Text style={{ color: '#EF4444' }}> *</Text>}
      </Text>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Text
        style={[
          {
            marginTop: 4,
            color: '#EF4444',
            fontSize: 12,
          },
          errorStyle,
        ]}
      >
        {error}
      </Text>
    );
  };

  const getInputStyle = (hasError: boolean) => ({
    borderWidth: 1,
    borderColor: hasError ? '#EF4444' : '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    color: disabled ? '#9CA3AF' : '#111827',
    backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
    fontSize: 16,
    paddingRight: 50, // Space for the eye icon
    ...inputStyle,
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {renderLabel()}
      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error: fieldError },
        }) => (
          <View style={{ position: 'relative' }}>
            <TextInput
              {...textInputProps}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!disabled}
              secureTextEntry={!showPassword}
              style={getInputStyle(!!fieldError || !!error)}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: [{ translateY: -12 }],
                padding: 4,
              }}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        )}
      />
      {renderError()}
      <Controller
        control={control}
        name={name}
        render={({ fieldState: { error: fieldError } }) => (
          <>
            {fieldError && !error && (
              <Text
                style={[
                  {
                    marginTop: 4,
                    color: '#EF4444',
                    fontSize: 12,
                  },
                  errorStyle,
                ]}
              >
                {fieldError.message}
              </Text>
            )}
          </>
        )}
      />
    </View>
  );
}
