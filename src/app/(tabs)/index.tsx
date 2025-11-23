import { COLORS } from '@/constants';
import { Category, Cost, CostFormData } from '@/interfaces';
import { categoryService } from '@/services/category.service';
import { costService } from '@/services/cost.service';
import { formatCurrency } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, DollarSign, Plus, Tag } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

// Validation schema
const costSchema = yup.object().shape({
  title: yup
    .string()
    .required('Description is required')
    .min(1, 'Description must be at least 1 character')
    .max(100, 'Description must be less than 100 characters'),
  amount: yup
    .string()
    .required('Amount is required')
    .test('is-positive', 'Amount must be greater than 0', (value) => {
      return parseFloat(value || '0') > 0;
    })
    .test('is-valid-number', 'Please enter a valid number', (value) => {
      return !isNaN(parseFloat(value || '0'));
    }),
  currency: yup.string().required('Currency is required'),
  categoryId: yup.string().required('Category is required'),
  incurredAt: yup
    .date()
    .required('Date is required')
    .typeError('Please select a valid date'),
});

export default function AddExpenseScreen() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<CostFormData>({
    resolver: yupResolver(costSchema),
    defaultValues: {
      amount: '',
      title: '',
      categoryId: '',
      currency: 'VND',
      incurredAt: new Date(),
    },
    mode: 'onChange',
  });

  useEffect(() => {
    fetchCosts();
    fetchCategories();
  }, []);

  const fetchCosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await costService.getAll();
      setCosts(response.items || []);
    } catch (err) {
      console.log(err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch categories'
      );
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getAll();
      setCategories(response.items || []);
    } catch (err) {
      console.log(err);

      setError(
        err instanceof Error ? err.message : 'Failed to fetch categories'
      );
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = async (data: CostFormData) => {
    try {
      const newCost = await costService.create({
        amount: parseFloat(data.amount),
        title: data.title,
        currency: data.currency,
        categoryId: data.categoryId,
        incurredAt: data.incurredAt.toISOString(),
      });

      if (newCost) {
        setCosts([...costs, newCost]);
        reset();
        Alert.alert('Success', 'Cost added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add cost');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to add cost'
      );
    }
  };

  const onSubmit = handleSubmit(handleAddCost);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Expense</Text>
          <Text style={styles.subtitle}>Track your daily spending</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Tag size={20} color="#10B981" />
              <Text style={styles.inputLabel}>Title</Text>
            </View>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="What did you buy?"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.title && (
              <Text style={styles.formErrorText}>{errors.title.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <DollarSign size={20} color="#10B981" />
              <Text style={styles.inputLabel}>Amount</Text>
            </View>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.amount && styles.inputError]}
                  placeholder="0.00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.amount && (
              <Text style={styles.formErrorText}>{errors.amount.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Calendar size={20} color="#10B981" />
              <Text style={styles.inputLabel}>Category</Text>
            </View>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.categoryButton,
                    errors.categoryId && styles.inputError,
                  ]}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text
                    style={
                      value
                        ? styles.categoryButtonText
                        : styles.categoryButtonPlaceholder
                    }
                  >
                    {categories.find((cat) => cat.id === value)?.name ||
                      'Select Category'}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {errors.categoryId && (
              <Text style={styles.formErrorText}>
                {errors.categoryId.message}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Calendar size={20} color="#10B981" />
              <Text style={styles.inputLabel}>Incurred At</Text>
            </View>
            <Controller
              control={control}
              name="incurredAt"
              render={({ field: { onChange, value } }) => (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={value}
                  mode="datetime"
                  is24Hour={true}
                  display="default"
                  onChange={(event: any, selectedDate?: Date) => {
                    if (event.type === 'set' && selectedDate) {
                      onChange(selectedDate);
                    }
                  }}
                />
              )}
            />
            {errors.incurredAt && (
              <Text style={styles.formErrorText}>
                {errors.incurredAt.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.addButton, !isValid && styles.addButtonDisabled]}
            onPress={onSubmit}
            disabled={!isValid}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recent Expenses</Text>
          {costs.slice(0, 5).map((cost) => (
            <View key={cost.id} style={styles.expenseCard}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDescription}>{cost.title}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                {formatCurrency(cost.amount, cost.currency)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchCategories}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setValue('categoryId', category.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <View
                      style={[
                        styles.categoryColor,
                        {
                          backgroundColor:
                            COLORS[Math.floor(Math.random() * COLORS.length)],
                        },
                      ]}
                    />
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {category.description && (
                        <Text style={styles.categoryDescription}>
                          {category.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    padding: 24,
    paddingTop: 0,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButton: {
    justifyContent: 'center',
  },
  categoryButtonText: {
    color: '#374151',
  },
  categoryButtonPlaceholder: {
    color: '#9CA3AF',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentSection: {
    padding: 24,
    paddingTop: 0,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
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
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  datePickerActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSaveButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#10B981',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateTimeOptions: {
    marginVertical: 20,
  },
  dateTimeOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateTimeOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  currentSelection: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentSelectionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentSelectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dateTimePickerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateTimePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 8,
  },
  dateTimePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  quickOptions: {
    marginBottom: 20,
  },
  quickOptionsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  quickOption: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  quickOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  formErrorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: 'transparent',
    elevation: 0,
  },
});
