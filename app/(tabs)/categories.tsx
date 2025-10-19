import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CreditCard as Edit3, Trash2, CircleAlert as AlertCircle } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  budget: number;
  spent: number;
  color: string;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', budget: 500, spent: 320, color: '#EF4444' },
  { id: '2', name: 'Transportation', budget: 200, spent: 150, color: '#3B82F6' },
  { id: '3', name: 'Shopping', budget: 300, spent: 280, color: '#8B5CF6' },
  { id: '4', name: 'Entertainment', budget: 150, spent: 90, color: '#F59E0B' },
  { id: '5', name: 'Bills & Utilities', budget: 400, spent: 380, color: '#10B981' },
  { id: '6', name: 'Healthcare', budget: 200, spent: 45, color: '#EC4899' },
];

const COLORS = ['#EF4444', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#14B8A6', '#F97316'];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAddCategory = () => {
    if (!name || !budget) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      budget: parseFloat(budget),
      spent: 0,
      color: selectedColor,
    };

    setCategories([...categories, newCategory]);
    resetForm();
    setShowAddModal(false);
    Alert.alert('Success', 'Category added successfully!');
  };

  const handleEditCategory = () => {
    if (!name || !budget || !editingCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setCategories(categories.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name, budget: parseFloat(budget), color: selectedColor }
        : cat
    ));

    resetForm();
    setEditingCategory(null);
    Alert.alert('Success', 'Category updated successfully!');
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories(categories.filter(cat => cat.id !== categoryId));
          },
        },
      ]
    );
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setBudget(category.budget.toString());
    setSelectedColor(category.color);
  };

  const resetForm = () => {
    setName('');
    setBudget('');
    setSelectedColor(COLORS[0]);
  };

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#EF4444';
    if (percentage >= 80) return '#F59E0B';
    return '#10B981';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>Manage your spending categories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {categories.map((category) => {
          const percentage = getProgressPercentage(category.spent, category.budget);
          const progressColor = getProgressColor(percentage);
          const remaining = category.budget - category.spent;

          return (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => startEdit(category)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.budgetInfo}>
                <View style={styles.budgetRow}>
                  <Text style={styles.spentText}>
                    ${category.spent.toFixed(2)} of ${category.budget.toFixed(2)}
                  </Text>
                  <Text style={[styles.percentageText, { color: progressColor }]}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%`, backgroundColor: progressColor }
                    ]}
                  />
                </View>

                <View style={styles.remainingRow}>
                  {remaining >= 0 ? (
                    <Text style={styles.remainingText}>
                      ${remaining.toFixed(2)} remaining
                    </Text>
                  ) : (
                    <View style={styles.overBudgetRow}>
                      <AlertCircle size={16} color="#EF4444" />
                      <Text style={styles.overBudgetText}>
                        ${Math.abs(remaining).toFixed(2)} over budget
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={showAddModal || editingCategory !== null}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Groceries"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Budget</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.colorPalette}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  resetForm();
                  setShowAddModal(false);
                  setEditingCategory(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={editingCategory ? handleEditCategory : handleAddCategory}
              >
                <Text style={styles.modalSaveText}>
                  {editingCategory ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
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
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  budgetInfo: {
    marginTop: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spentText: {
    fontSize: 16,
    color: '#374151',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingRow: {
    alignItems: 'flex-start',
  },
  remainingText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  overBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overBudgetText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 4,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
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
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#374151',
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
});