import React from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Circle } from 'lucide-react-native';
import { FormRadioProps, SelectOption } from './types';

export function FormRadio<T extends FieldValues = FieldValues>({
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
  options,
  radioDirection = 'vertical',
}: FormRadioProps<T>) {
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

  const getRadioStyle = (
    isSelected: boolean,
    hasError: boolean
  ): ViewStyle => ({
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: hasError ? '#EF4444' : isSelected ? '#10B981' : '#D1D5DB',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    ...(inputStyle as ViewStyle),
  });

  const renderRadioOption = (
    option: SelectOption,
    isSelected: boolean,
    hasError: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[
        styles.radioOption,
        radioDirection === 'horizontal' && styles.radioOptionHorizontal,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={getRadioStyle(isSelected, hasError)}>
        {isSelected && <Circle size={10} color="#10B981" />}
      </View>
      <Text
        style={[
          {
            color: disabled ? '#9CA3AF' : '#374151',
            fontSize: 16,
            fontWeight: '400',
            marginLeft: 8,
          },
          labelStyle,
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderLabel = () => {
    if (!label) return null;

    return (
      <Text
        style={[
          {
            marginBottom: 12,
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
          <View
            style={[
              styles.radioGroup,
              radioDirection === 'horizontal' && styles.radioGroupHorizontal,
            ]}
          >
            {options.map((option) => {
              const isSelected = value === option.value;
              const hasError = !!fieldError || !!error;

              return renderRadioOption(option, isSelected, hasError, () => {
                if (!disabled) {
                  onChange(option.value);
                }
              });
            })}
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

const styles = StyleSheet.create({
  radioGroup: {
    flexDirection: 'column',
  },
  radioGroupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioOptionHorizontal: {
    marginRight: 16,
    marginBottom: 0,
  },
});
