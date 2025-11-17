import React, { useState } from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { FormSelectProps, SelectOption } from './types';

export function FormSelect<T extends FieldValues = FieldValues>({
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
  placeholder = 'Select an option',
}: FormSelectProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

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

  const getSelectedLabel = (value: string | number | undefined) => {
    if (!value) return placeholder;
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : placeholder;
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
    ...(inputStyle as ViewStyle),
  });

  const renderOptionItem = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => {
        // This will be handled by the Controller
        setModalVisible(false);
      }}
    >
      <Text style={styles.optionText}>{item.label}</Text>
    </TouchableOpacity>
  );

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
          <>
            <TouchableOpacity
              style={getInputStyle(!!fieldError || !!error)}
              onPress={() => !disabled && setModalVisible(true)}
              disabled={disabled}
              onBlur={onBlur}
            >
              <View style={styles.selectContent}>
                <Text
                  style={[
                    {
                      color: value ? '#111827' : '#9CA3AF',
                      fontSize: 16,
                    },
                    disabled && { color: '#9CA3AF' },
                  ]}
                >
                  {getSelectedLabel(value)}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>

            <Modal
              visible={modalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select an option</Text>
                  </View>
                  <FlatList
                    data={options}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                          onChange(item.value);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.optionText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.value.toString()}
                    style={styles.optionsList}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </>
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
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  optionsList: {
    flexGrow: 0,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
});
