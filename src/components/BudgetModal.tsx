import React, { useState, useEffect } from 'react';
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
import { Target, Calendar, Plus, X, DollarSign } from 'lucide-react-native';
import {
  BudgetFormData,
  CategoryBudgetAllocation,
  Category,
} from '@/interfaces';
import { budgetService, categoryService } from '@/services';
import { COLORS } from '@/constants';
import * as yup from 'yup';

const budgetSchema = yup.object().shape({
  name: yup
    .string()
    .required('Budget name is required')
    .min(2, 'Name must be at least 2 characters'),
  description: yup.string().optional(),
  amount: yup
    .string()
    .required('Total budget amount is required')
    .test('is-positive', 'Amount must be greater than 0', (value) => {
      return parseFloat(value?.replace(/[^\d]/g, '') || '0') > 0;
    }),
  currency: yup.string().required('Currency is required'),
  period: yup
    .string()
    .oneOf(['monthly', 'yearly', 'weekly'])
    .required('Period is required'),
  startDate: yup
    .date()
    .required('Start date is required')
    .typeError('Please select a valid date'),
  endDate: yup
    .date()
    .required('End date is required')
    .typeError('Please select a valid date')
    .min(yup.ref('startDate'), 'End date must be after start date'),
});

interface BudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBudget?: any;
}

export default function BudgetModal({
  visible,
  onClose,
  onSuccess,
  editingBudget,
}: BudgetModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [categoryAllocations, setCategoryAllocations] = useState<
    CategoryBudgetAllocation[]
  >([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
    watch,
  } = useForm<BudgetFormData>({
    resolver: yupResolver(budgetSchema),
    defaultValues: {
      name: '',
      description: '',
      amount: '',
      currency: 'VND',
      period: 'monthly',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      categories: [],
    },
  });

  const watchedAmount = watch('amount');

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  useEffect(() => {
    if (editingBudget) {
      setValue('name', editingBudget.name);
      setValue('description', editingBudget.description || '');
      setValue('amount', editingBudget.amount.toString());
      setValue('currency', editingBudget.currency);
      setValue('period', editingBudget.period);
      setValue('startDate', new Date(editingBudget.startDate));
      setValue('endDate', new Date(editingBudget.endDate));

      if (editingBudget.categories) {
        const allocations = editingBudget.categories.map((cat: any) => ({
          categoryId: cat.categoryId,
          allocatedAmount: cat.allocatedAmount.toString(),
        }));
        setCategoryAllocations(allocations);
      }
    } else {
      reset();
      setCategoryAllocations([]);
    }
  }, [editingBudget, setValue, reset]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.items || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addCategoryAllocation = (categoryId: string) => {
    const existing = categoryAllocations.find(
      (a) => a.categoryId === categoryId
    );
    if (!existing) {
      setCategoryAllocations([
        ...categoryAllocations,
        {
          categoryId,
          allocatedAmount: '0',
        },
      ]);
    }
  };

  const updateCategoryAllocation = (categoryId: string, amount: string) => {
    setCategoryAllocations((allocations) =>
      allocations.map((a) =>
        a.categoryId === categoryId ? { ...a, allocatedAmount: amount } : a
      )
    );
  };

  const removeCategoryAllocation = (categoryId: string) => {
    setCategoryAllocations((allocations) =>
      allocations.filter((a) => a.categoryId !== categoryId)
    );
  };

  const getTotalAllocated = () => {
    return categoryAllocations.reduce((sum, allocation) => {
      return (
        sum +
        parseFloat(allocation.allocatedAmount.replace(/[^\d]/g, '') || '0')
      );
    }, 0);
  };

  const handleSaveBudget = async (data: BudgetFormData) => {
    try {
      setLoading(true);

      const totalAllocated = getTotalAllocated();
      const totalBudget = parseFloat(data.amount.replace(/[^\d]/g, '') || '0');

      if (totalAllocated > totalBudget) {
        Alert.alert('Error', 'Total allocated amount exceeds budget total');
        return;
      }

      const budgetData: any = {
        name: data.name,
        description: data.description,
        amount: totalBudget,
        currency: data.currency,
        period: data.period,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        isActive: true,
        categories: categoryAllocations.map((allocation) => ({
          categoryId: allocation.categoryId,
          allocatedAmount: parseFloat(
            allocation.allocatedAmount.replace(/[^\d]/g, '') || '0'
          ),
          spentAmount: 0,
          percentage: 0,
        })),
      };

      if (editingBudget) {
        await budgetService.update(editingBudget.id, budgetData);
        Alert.alert('Success', 'Budget updated successfully!');
      } else {
        await budgetService.create(budgetData);
        Alert.alert('Success', 'Budget created successfully!');
      }

      onSuccess();
      onClose();
      reset();
      setCategoryAllocations([]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save budget'
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit(handleSaveBudget);

  const totalBudget = parseFloat(watchedAmount?.replace(/[^\d]/g, '') || '0');
  const totalAllocated = getTotalAllocated();
  const remaining = totalBudget - totalAllocated;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingBudget ? 'Edit Budget' : 'Create Budget'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Target size={20} color="#10B981" />
                <Text style={styles.inputLabel}>Budget Name</Text>
              </View>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="e.g., Monthly Budget 2024"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor="#9CA3AF"
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add a description for your budget"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#9CA3AF"
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.inputLabel}>Total Budget Amount</Text>
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
              <Text style={styles.inputLabel}>Period</Text>
              <View style={styles.periodButtons}>
                {(['monthly', 'yearly', 'weekly'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      control._formValues.period === period &&
                        styles.periodButtonActive,
                    ]}
                    onPress={() => setValue('period', period)}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        control._formValues.period === period &&
                          styles.periodButtonTextActive,
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.dateInputs}>
                <View style={styles.dateInputContainer}>
                  <View style={styles.inputHeader}>
                    <Calendar size={20} color="#10B981" />
                    <Text style={styles.inputLabel}>Start Date</Text>
                  </View>
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <TouchableOpacity
                          style={[styles.input, styles.dateButton]}
                          onPress={() => setShowStartPicker(true)}
                        >
                          <Text style={styles.dateText}>
                            {value.toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                          <DateTimePicker
                            value={value}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                              setShowStartPicker(false);
                              if (selectedDate) {
                                onChange(selectedDate);
                              }
                            }}
                          />
                        )}
                      </View>
                    )}
                  />
                </View>

                <View style={styles.dateInputContainer}>
                  <View style={styles.inputHeader}>
                    <Calendar size={20} color="#10B981" />
                    <Text style={styles.inputLabel}>End Date</Text>
                  </View>
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <TouchableOpacity
                          style={[styles.input, styles.dateButton]}
                          onPress={() => setShowEndPicker(true)}
                        >
                          <Text style={styles.dateText}>
                            {value.toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                        {showEndPicker && (
                          <DateTimePicker
                            value={value}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                              setShowEndPicker(false);
                              if (selectedDate) {
                                onChange(selectedDate);
                              }
                            }}
                          />
                        )}
                      </View>
                    )}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.inputLabel}>Category Allocations</Text>
                <Text
                  style={[
                    styles.allocationSummary,
                    remaining < 0 && styles.allocationNegative,
                  ]}
                >
                  Remaining: {new Intl.NumberFormat('vi-VN').format(remaining)}
                </Text>
              </View>

              {categoryAllocations.map((allocation) => {
                const category = categories.find(
                  (c) => c.id === allocation.categoryId
                );
                if (!category) return null;

                return (
                  <View
                    key={allocation.categoryId}
                    style={styles.categoryAllocation}
                  >
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor:
                              COLORS[Math.floor(Math.random() * COLORS.length)],
                          },
                        ]}
                      />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <View style={styles.categoryAmountInput}>
                      <TextInput
                        style={styles.allocationInput}
                        value={allocation.allocatedAmount}
                        onChangeText={(text) => {
                          const cleanValue = text.replace(/[^\d]/g, '');
                          const formattedValue = new Intl.NumberFormat(
                            'vi-VN'
                          ).format(parseFloat(cleanValue) || 0);
                          updateCategoryAllocation(
                            allocation.categoryId,
                            formattedValue
                          );
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() =>
                          removeCategoryAllocation(allocation.categoryId)
                        }
                      >
                        <X size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => {
                  // Show category selection modal or picker
                  Alert.alert(
                    'Add Category',
                    'Select a category to add to your budget',
                    categories.map((cat) => ({
                      text: cat.name,
                      onPress: () => addCategoryAllocation(cat.id),
                    }))
                  );
                }}
              >
                <Plus size={16} color="#10B981" />
                <Text style={styles.addCategoryText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                onClose();
                reset();
                setCategoryAllocations([]);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
              onPress={onSubmit}
              disabled={!isValid || loading}
            >
              {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : editingBudget ? 'Update' : 'Create'}
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
    maxHeight: '90%',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allocationSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  allocationNegative: {
    color: '#EF4444',
  },
  categoryAllocation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allocationInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 120,
    textAlign: 'right',
  },
  removeButton: {
    padding: 4,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    marginTop: 8,
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
