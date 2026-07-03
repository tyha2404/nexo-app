import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { DollarSign, Calendar, X } from 'lucide-react-native';
import { SalaryFormData } from '@/interfaces';
import { salaryService } from '@/services';
import * as yup from 'yup';

const salarySchema = yup.object().shape({
  amount: yup
    .string()
    .required('Amount is required')
    .test('is-positive', 'Amount must be greater than 0', (value) => {
      return parseFloat(value?.replace(/[^\d]/g, '') || '0') > 0;
    }),
  currency: yup.string().required('Currency is required'),
  frequency: yup
    .string()
    .oneOf(['monthly', 'yearly', 'weekly', 'bi-weekly'])
    .required('Frequency is required'),
  nextPayDate: yup
    .date()
    .required('Next pay date is required')
    .typeError('Please select a valid date'),
});

interface SalaryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSalary?: any;
}

export default function SalaryModal({
  visible,
  onClose,
  onSuccess,
  editingSalary,
}: SalaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<SalaryFormData>({
    resolver: yupResolver(salarySchema),
    defaultValues: {
      amount: '',
      currency: 'VND',
      frequency: 'monthly',
      nextPayDate: new Date(),
    },
  });

  React.useEffect(() => {
    if (editingSalary) {
      setValue('amount', editingSalary.amount.toString());
      setValue('currency', editingSalary.currency);
      setValue('frequency', editingSalary.frequency);
      setValue('nextPayDate', new Date(editingSalary.nextPayDate));
    } else {
      reset();
    }
  }, [editingSalary, setValue, reset]);

  const handleSaveSalary = async (data: SalaryFormData) => {
    try {
      setLoading(true);

      const salaryData = {
        amount: parseFloat(data.amount.replace(/[^\d]/g, '')),
        currency: data.currency,
        frequency: data.frequency,
        nextPayDate: data.nextPayDate.toISOString(),
        isActive: true,
      };

      if (editingSalary) {
        await salaryService.update(editingSalary.id, salaryData);
        Alert.alert('Success', 'Salary updated successfully!');
      } else {
        await salaryService.create(salaryData);
        Alert.alert('Success', 'Salary added successfully!');
      }

      onSuccess();
      onClose();
      reset();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save salary'
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit(handleSaveSalary);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSalary ? 'Edit Salary' : 'Add Salary'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.inputLabel}>Salary Amount</Text>
              </View>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.amount && styles.inputError]}
                    placeholder="0"
                    value={value}
                    onChangeText={(text) => {
                      const cleanValue = text.replace(/[^\d]/g, '');
                      const formattedValue = new Intl.NumberFormat(
                        'vi-VN'
                      ).format(parseFloat(cleanValue) || 0);
                      onChange(formattedValue);
                    }}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                )}
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <View style={styles.frequencyButtons}>
                {(['monthly', 'yearly', 'weekly', 'bi-weekly'] as const).map(
                  (frequency) => (
                    <TouchableOpacity
                      key={frequency}
                      style={[
                        styles.frequencyButton,
                        control._formValues.frequency === frequency &&
                          styles.frequencyButtonActive,
                      ]}
                      onPress={() => setValue('frequency', frequency)}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          control._formValues.frequency === frequency &&
                            styles.frequencyButtonTextActive,
                        ]}
                      >
                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Calendar size={20} color="#10B981" />
                <Text style={styles.inputLabel}>Next Pay Date</Text>
              </View>
              <Controller
                control={control}
                name="nextPayDate"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TouchableOpacity
                      style={[styles.input, styles.dateButton]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateText}>
                        {value.toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={value}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            onChange(selectedDate);
                          }
                        }}
                      />
                    )}
                  </View>
                )}
              />
              {errors.nextPayDate && (
                <Text style={styles.errorText}>
                  {errors.nextPayDate.message}
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                onClose();
                reset();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={onSubmit}
              disabled={!isValid || loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : editingSalary ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  dateButton: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  frequencyButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
