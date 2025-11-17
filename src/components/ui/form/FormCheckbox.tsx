import React from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import { Text, View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { FormCheckboxProps } from './types';

export function FormCheckbox<T extends FieldValues = FieldValues>({
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
  checkboxPosition = 'left',
}: FormCheckboxProps<T>) {
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

  const getCheckboxStyle = (isChecked: boolean, hasError: boolean): ViewStyle => ({
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: hasError ? '#EF4444' : isChecked ? '#10B981' : '#D1D5DB',
    backgroundColor: isChecked ? '#10B981' : 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    ...(inputStyle as ViewStyle),
  });

  const renderCheckbox = (
    isChecked: boolean,
    hasError: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={getCheckboxStyle(isChecked, hasError)}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {isChecked && <Check size={14} color="#FFFFFF" />}
    </TouchableOpacity>
  );

  const renderLabel = () => (
    <Text
      style={[
        {
          color: disabled ? '#9CA3AF' : '#374151',
          fontSize: 16,
          fontWeight: '400',
          flex: 1,
        },
        labelStyle,
      ]}
    >
      {label}
      {required && <Text style={{ color: '#EF4444' }}> *</Text>}
    </Text>
  );

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error: fieldError },
        }) => {
          const handlePress = () => {
            if (!disabled) {
              onChange(!value);
            }
          };

          return (
            <View style={styles.container}>
              {checkboxPosition === 'left' ? (
                <>
                  {renderCheckbox(value, !!fieldError || !!error, handlePress)}
                  <View style={styles.labelContainer}>{renderLabel()}</View>
                </>
              ) : (
                <>
                  <View style={styles.labelContainer}>{renderLabel()}</View>
                  {renderCheckbox(value, !!fieldError || !!error, handlePress)}
                </>
              )}
            </View>
          );
        }}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelContainer: {
    marginLeft: 8,
    flex: 1,
  },
});
