import React from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  TextInput,
  Text,
  View,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { FormInputProps } from './types';

export function FormInput<T extends FieldValues = FieldValues>({
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
}: FormInputProps<T>) {
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

  const getInputStyle = (hasError: boolean): TextStyle => ({
    borderWidth: 1,
    borderColor: hasError ? '#EF4444' : '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    color: disabled ? '#9CA3AF' : '#111827',
    backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
    fontSize: 16,
    ...inputStyle,
  });

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
          <TextInput
            {...textInputProps}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!disabled}
            style={getInputStyle(!!fieldError || !!error)}
            placeholderTextColor="#9CA3AF"
          />
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
