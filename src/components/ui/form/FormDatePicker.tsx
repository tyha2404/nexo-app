import React, { useState } from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import { Text, View, TouchableOpacity, Platform, Alert, ViewStyle } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { FormDatePickerProps } from './types';

// Types for DateTimePicker (since it might not be installed)
interface DateTimePickerEvent {
  type: 'set' | 'dismissed';
  nativeEvent: {
    timestamp?: number;
  };
}

export function FormDatePicker<T extends FieldValues = FieldValues>({
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
  mode = 'date',
  minimumDate,
  maximumDate,
}: FormDatePickerProps<T>) {
  const [showPicker, setShowPicker] = useState(false);

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

  const getInputStyle = (hasError: boolean): ViewStyle => ({
    borderWidth: 1,
    borderColor: hasError ? '#EF4444' : '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: disabled ? '#F9FAFB' : '#FFFFFF',
    minHeight: 48,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    ...(inputStyle as ViewStyle),
  });

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Select date';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (mode === 'time') {
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (mode === 'datetime') {
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const showDatepicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  const onDateChange = (
    event: DateTimePickerEvent,
    onChange: (value: Date) => void,
    selectedDate?: Date
  ) => {
    setShowPicker(false);

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
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
        }) => {
          const handleDateChange = (
            event: DateTimePickerEvent,
            selectedDate?: Date
          ) => {
            onDateChange(event, onChange, selectedDate);
          };

          return (
            <>
              <TouchableOpacity
                style={getInputStyle(!!fieldError || !!error)}
                onPress={showDatepicker}
                disabled={disabled}
                onBlur={onBlur}
              >
                <Text
                  style={{
                    color: value ? '#111827' : '#9CA3AF',
                    fontSize: 16,
                    flex: 1,
                  }}
                >
                  {formatDate(value)}
                </Text>
                <Calendar size={20} color="#6B7280" />
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={value ? new Date(value) : new Date()}
                  mode={mode}
                  is24Hour={true}
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                />
              )}
            </>
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

// Import DateTimePicker at the top level
let DateTimePicker: any;

try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (error) {
  console.warn(
    'DateTimePicker not installed. Please install @react-native-community/datetimepicker'
  );
  DateTimePicker = () => null;
}
