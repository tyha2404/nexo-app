import React from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { FormSwitchProps } from './types';

export function FormSwitch<T extends FieldValues = FieldValues>({
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
}: FormSwitchProps<T>) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

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

  const getSwitchStyle = (
    isEnabled: boolean,
    hasError: boolean
  ): ViewStyle => ({
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: hasError ? '#FEE2E2' : isEnabled ? '#D1FAE5' : '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
    ...(inputStyle as ViewStyle),
  });

  const getThumbStyle = (isEnabled: boolean, hasError: boolean) => ({
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: hasError ? '#EF4444' : isEnabled ? '#10B981' : '#9CA3AF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  });

  const animateSwitch = (toValue: number) => {
    Animated.timing(animatedValue, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const renderSwitch = (
    isEnabled: boolean,
    hasError: boolean,
    onPress: () => void
  ) => {
    React.useEffect(() => {
      animateSwitch(isEnabled ? 1 : 0);
    }, [isEnabled]);

    const thumbPosition = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 22],
    });

    return (
      <TouchableOpacity
        style={getSwitchStyle(isEnabled, hasError)}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            getThumbStyle(isEnabled, hasError),
            {
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

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
              {renderLabel()}
              {renderSwitch(value, !!fieldError || !!error, handlePress)}
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
    justifyContent: 'space-between',
  },
});
