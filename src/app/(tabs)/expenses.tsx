import { COLORS } from '@/constants';
import { Category, Cost, CostFormData } from '@/interfaces';
import { categoryService } from '@/services/category.service';
import { costService } from '@/services/cost.service';
import { formatCurrency } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import {
  CircleAlert as AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
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

// Validation schema for editing
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

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Cost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Cost | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showMonthModal, setShowMonthModal] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
      fetchCategories();
    }, [selectedMonth])
  );

  useEffect(() => {
    filterAndSortExpenses();
  }, [expenses, searchQuery, selectedCategory, sortBy, sortOrder]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate start and end dates for the selected month
      const startDate = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        1
      );
      const endDate = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + 1,
        0
      );

      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        return moment(date).format('YYYY-MM-DD');
      };

      const response = await costService.getAll({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });

      setExpenses(response.items || []);
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.items || []);
    } catch (err) {
      console.log(err);
    }
  };

  const filterAndSortExpenses = () => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (expense) =>
          expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          expense.Category.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (expense) => expense.categoryId === selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = moment(a.incurredAt).diff(moment(b.incurredAt));
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredExpenses(filtered);
  };

  const handleEditExpense = (expense: Cost) => {
    setEditingExpense(expense);
    setValue('title', expense.title);
    setValue('amount', expense.amount.toString());
    setValue('categoryId', expense.categoryId);
    setValue('currency', expense.currency);
    setValue('incurredAt', moment(expense.incurredAt).toDate());
    setShowEditModal(true);
  };

  const handleUpdateExpense = async (data: CostFormData) => {
    if (!editingExpense) return;

    try {
      const updatedExpense = await costService.update(editingExpense.id, {
        amount: parseFloat(data.amount),
        title: data.title,
        currency: data.currency,
        categoryId: data.categoryId,
        incurredAt: moment(data.incurredAt).toISOString(),
      });

      if (updatedExpense) {
        setExpenses(
          expenses.map((exp) =>
            exp.id === editingExpense.id ? updatedExpense : exp
          )
        );
        reset();
        setShowEditModal(false);
        setEditingExpense(null);
        Alert.alert('Success', 'Expense updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update expense');
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to update expense'
      );
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await costService.delete(expenseId);
              setExpenses(expenses.filter((exp) => exp.id !== expenseId));
              Alert.alert('Success', 'Expense deleted successfully!');
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete expense'
              );
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedMonth(new Date());
    setSortBy('date');
    setSortOrder('desc');
  };

  const onSubmit = handleSubmit(handleUpdateExpense);

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Group expenses by day
  const groupExpensesByDay = (expenses: Cost[]) => {
    const groups: { [key: string]: { date: string; expenses: Cost[] } } = {};

    expenses.forEach((expense) => {
      if (!expense.incurredAt) return;

      const momentDate = moment(expense.incurredAt);
      const dateKey = momentDate.format('YYYY-MM-DD');
      const dateString = momentDate.format('dddd, MMMM D, YYYY');

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateString,
          expenses: [],
        };
      }

      groups[dateKey].expenses.push(expense);
    });

    // Convert to array, sort by date (newest first) and add total
    return Object.entries(groups)
      .sort(([dateA], [dateB]) =>
        moment(dateB, 'YYYY-MM-DD').diff(moment(dateA, 'YYYY-MM-DD'))
      )
      .map(([_, { date, expenses }]) => ({
        date,
        expenses,
        total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      }));
  };

  const groupedExpenses = groupExpensesByDay(filteredExpenses);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.subtitle}>Manage your spending</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAmount}>
            {formatCurrency(totalAmount, 'VND')}
          </Text>
          <Text style={styles.summaryLabel}>
            Total ({filteredExpenses.length} expenses)
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#374151" />
          <Text style={styles.filterButtonText}>Filters</Text>
          {(selectedCategory ||
            sortBy !== 'date' ||
            sortOrder !== 'desc' ||
            moment(selectedMonth).month() !== moment().month() ||
            moment(selectedMonth).year() !== moment().year()) && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Month:</Text>
            <TouchableOpacity
              style={styles.categoryFilterButton}
              onPress={() => setShowMonthModal(true)}
            >
              <Text style={styles.categoryFilterText}>
                {moment(selectedMonth).format('MMMM YYYY')}
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category:</Text>
            <TouchableOpacity
              style={styles.categoryFilterButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.categoryFilterText}>
                {selectedCategory
                  ? categories.find((cat) => cat.id === selectedCategory)
                      ?.name || 'All'
                  : 'All Categories'}
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <View style={styles.sortButtons}>
              {(['date', 'amount', 'title'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortButton,
                    sortBy === option && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(option)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortBy === option && styles.sortButtonTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <ChevronUp size={16} color="#374151" />
              ) : (
                <ChevronDown size={16} color="#374151" />
              )}
              <Text style={styles.sortOrderText}>
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchExpenses}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : groupedExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory
                ? 'Try adjusting your filters'
                : 'Add your first expense to get started'}
            </Text>
          </View>
        ) : (
          groupedExpenses.map((group) => (
            <View key={group.date} style={styles.dayGroup}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>
                  {moment(group.date, 'dddd, MMMM D, YYYY').format('dddd')}
                </Text>
                <View style={styles.dayHeaderRight}>
                  <Text style={styles.dayDate}>
                    {moment(group.date, 'dddd, MMMM D, YYYY').format(
                      'MMM D, YYYY'
                    )}
                  </Text>
                  <Text style={styles.dayTotal}>
                    {formatCurrency(group.total, 'VND')}
                  </Text>
                </View>
              </View>

              {group.expenses.map((expense) => (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseHeader}>
                    <View style={styles.expenseInfo}>
                      <View
                        style={[
                          styles.categoryColor,
                          {
                            backgroundColor:
                              COLORS[Math.floor(Math.random() * COLORS.length)],
                          },
                        ]}
                      />
                      <View style={styles.expenseTextInfo}>
                        <Text style={styles.expenseTitle}>{expense.title}</Text>
                        <Text style={styles.expenseCategory}>
                          {expense.Category.name}
                        </Text>
                        <Text style={styles.expenseTime}>
                          {moment(expense.incurredAt).format('h:mm A')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.expenseAmountSection}>
                      <Text style={styles.expenseAmount}>
                        {formatCurrency(expense.amount, expense.currency)}
                      </Text>
                      <View style={styles.expenseActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleEditExpense(expense)}
                        >
                          <Edit3 size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Expense</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
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
              <Text style={styles.inputLabel}>Amount</Text>
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
                <Text style={styles.formErrorText}>
                  {errors.amount.message}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
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
              <Text style={styles.inputLabel}>Date</Text>
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

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  reset();
                  setShowEditModal(false);
                  setEditingExpense(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={onSubmit}
                disabled={!isValid}
              >
                <Text style={styles.modalSaveText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => {
                  if (showEditModal) {
                    setValue('categoryId', '');
                  } else {
                    setSelectedCategory('');
                  }
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.categoryName}>All Categories</Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryOption}
                  onPress={() => {
                    if (showEditModal) {
                      setValue('categoryId', category.id);
                    } else {
                      setSelectedCategory(category.id);
                    }
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
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal visible={showMonthModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <ScrollView>
              {Array.from({ length: 24 }, (_, index) => {
                const date = new Date();
                date.setMonth(date.getMonth() - index);
                const isSelected =
                  date.getMonth() === selectedMonth.getMonth() &&
                  date.getFullYear() === selectedMonth.getFullYear();

                return (
                  <TouchableOpacity
                    key={`${date.getFullYear()}-${date.getMonth()}`}
                    style={[
                      styles.categoryOption,
                      isSelected && styles.categoryOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedMonth(new Date(date));
                      setShowMonthModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryName,
                        isSelected && styles.categoryNameSelected,
                      ]}
                    >
                      {date.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                    {isSelected && (
                      <Text style={styles.selectedIndicator}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMonthModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Navigate to add expense screen or show add modal
          // For now, we'll use the existing index.tsx as add expense
          // In a real app, you might want to navigate to a dedicated add screen
          Alert.alert(
            'Add Expense',
            'This would open the add expense screen. For now, use the Categories tab to add expenses.'
          );
        }}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  filterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  filtersPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryFilterText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 18,
  },
  sortOrderText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  clearFiltersButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 2,
  },
  expenseTextInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  expenseTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  expenseAmountSection: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  dayGroup: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dayDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  dayTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  expenseCategory: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
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
    marginTop: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  categoryButton: {
    justifyContent: 'center',
  },
  categoryButtonText: {
    color: '#374151',
  },
  categoryButtonPlaceholder: {
    color: '#9CA3AF',
  },
  formErrorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  modalActions: {
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
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  categoryOptionSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  categoryNameSelected: {
    color: '#10B981',
  },
  selectedIndicator: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
