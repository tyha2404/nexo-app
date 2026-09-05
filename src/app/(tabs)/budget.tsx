import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  TrendingUp,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Target,
  Calendar,
  PiggyBank,
  CreditCard,
} from 'lucide-react-native';
import { budgetService, salaryService } from '@/services';
import { Budget, Salary, BudgetSummary } from '@/interfaces';
import { formatCurrency } from '@/utils';
import { COLORS } from '@/constants';
import SalaryModal from '@/components/SalaryModal';
import BudgetModal from '@/components/BudgetModal';

const { width } = Dimensions.get('window');

export default function BudgetScreen() {
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);
  const [activeSalary, setActiveSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      fetchBudgetData();
    }, [])
  );

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      // In a real app, get user ID from auth service
      const userId = 'current-user-id';

      const [budget, salary] = await Promise.all([
        budgetService.getActiveBudget(userId),
        salaryService.getActiveSalary(userId),
      ]);

      setActiveBudget(budget);
      setActiveSalary(salary);

      if (budget) {
        const summary = await budgetService.getBudgetSummary(budget.id);
        setBudgetSummary(summary);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      Alert.alert('Error', 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleSalarySuccess = () => {
    fetchBudgetData();
  };

  const handleBudgetSuccess = () => {
    fetchBudgetData();
  };

  const renderSalaryCard = () => {
    if (!activeSalary) {
      return (
        <TouchableOpacity
          style={styles.setupCard}
          onPress={() => setShowSalaryModal(true)}
        >
          <PiggyBank size={32} color="#10B981" />
          <Text style={styles.setupCardTitle}>Set Up Your Salary</Text>
          <Text style={styles.setupCardSubtitle}>
            Track your income and manage your budget effectively
          </Text>
          <View style={styles.setupButton}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.setupButtonText}>Add Salary</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.salaryCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <DollarSign size={24} color="#10B981" />
          </View>
          <Text style={styles.cardTitle}>Monthly Salary</Text>
          <TouchableOpacity onPress={() => setShowSalaryModal(true)}>
            <Edit3 size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.salaryAmount}>
          {formatCurrency(activeSalary.amount, activeSalary.currency)}
        </Text>
        <Text style={styles.salaryFrequency}>
          {activeSalary.frequency.charAt(0).toUpperCase() +
            activeSalary.frequency.slice(1)}
        </Text>
        <View style={styles.salaryInfo}>
          <View style={styles.infoItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              Next pay:{' '}
              {new Date(activeSalary.nextPayDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBudgetCard = () => {
    if (!activeBudget) {
      return (
        <TouchableOpacity
          style={styles.setupCard}
          onPress={() => setShowBudgetModal(true)}
        >
          <Target size={32} color="#6366F1" />
          <Text style={styles.setupCardTitle}>Create Your Budget</Text>
          <Text style={styles.setupCardSubtitle}>
            Set spending limits and track your financial goals
          </Text>
          <View style={styles.setupButton}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.setupButtonText}>Create Budget</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const percentageUsed = budgetSummary?.percentageUsed || 0;
    const isOverBudget = percentageUsed > 100;

    return (
      <View style={styles.budgetCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <TrendingUp size={24} color="#6366F1" />
          </View>
          <Text style={styles.cardTitle}>{activeBudget.name}</Text>
          <TouchableOpacity onPress={() => setShowBudgetModal(true)}>
            <Edit3 size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.budgetOverview}>
          <View style={styles.budgetAmounts}>
            <View>
              <Text style={styles.budgetLabel}>Allocated</Text>
              <Text style={styles.budgetAllocated}>
                {formatCurrency(
                  budgetSummary?.totalAllocated || 0,
                  activeBudget.currency
                )}
              </Text>
            </View>
            <View style={styles.budgetSpentContainer}>
              <Text style={styles.budgetLabel}>Spent</Text>
              <Text
                style={[
                  styles.budgetSpent,
                  isOverBudget && styles.budgetOverSpent,
                ]}
              >
                {formatCurrency(
                  budgetSummary?.totalSpent || 0,
                  activeBudget.currency
                )}
              </Text>
            </View>
            <View>
              <Text style={styles.budgetLabel}>Remaining</Text>
              <Text
                style={[
                  styles.budgetRemaining,
                  isOverBudget && styles.budgetNegative,
                ]}
              >
                {formatCurrency(
                  budgetSummary?.remaining || 0,
                  activeBudget.currency
                )}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(percentageUsed, 100)}%` },
                  isOverBudget && styles.progressOverBudget,
                ]}
              />
            </View>
            <Text
              style={[
                styles.percentageText,
                isOverBudget && styles.percentageOverBudget,
              ]}
            >
              {percentageUsed.toFixed(1)}% used
            </Text>
          </View>
        </View>

        <View style={styles.budgetPeriod}>
          <Text style={styles.periodText}>
            {activeBudget.period.charAt(0).toUpperCase() +
              activeBudget.period.slice(1)}{' '}
            budget
          </Text>
          <Text style={styles.periodDate}>
            {new Date(activeBudget.startDate).toLocaleDateString()} -{' '}
            {new Date(activeBudget.endDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!budgetSummary?.categories || budgetSummary.categories.length === 0) {
      return null;
    }

    return (
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {budgetSummary.categories.map((category) => {
          const isOverCategoryBudget = category.percentage > 100;

          return (
            <View key={category.id} style={styles.categoryItem}>
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
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>
                    {category.category?.name || 'Unknown Category'}
                  </Text>
                  <Text style={styles.categorySpent}>
                    {formatCurrency(
                      category.spentAmount,
                      activeBudget?.currency || 'VND'
                    )}{' '}
                    of{' '}
                    {formatCurrency(
                      category.allocatedAmount,
                      activeBudget?.currency || 'VND'
                    )}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryStats}>
                <Text
                  style={[
                    styles.categoryPercentage,
                    isOverCategoryBudget && styles.categoryOverBudget,
                  ]}
                >
                  {category.percentage.toFixed(1)}%
                </Text>
                <View style={styles.categoryProgress}>
                  <View style={styles.categoryProgressBar}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        { width: `${Math.min(category.percentage, 100)}%` },
                        isOverCategoryBudget &&
                          styles.categoryProgressOverBudget,
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderQuickActions = () => {
    return (
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <CreditCard size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Target size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Adjust Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <AlertCircle size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>View Insights</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading budget data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        <Text style={styles.subtitle}>Manage your salary and expenses</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderSalaryCard()}
        {renderBudgetCard()}
        {renderCategoryBreakdown()}
        {renderQuickActions()}
      </ScrollView>

      <SalaryModal
        visible={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        onSuccess={handleSalarySuccess}
        editingSalary={activeSalary}
      />

      <BudgetModal
        visible={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        onSuccess={handleBudgetSuccess}
        editingBudget={activeBudget}
      />
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
  },
  scrollView: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  setupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  setupCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  setupCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  salaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  salaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  salaryFrequency: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  salaryInfo: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  budgetOverview: {
    marginBottom: 16,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  budgetAllocated: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  budgetSpentContainer: {
    alignItems: 'center',
  },
  budgetSpent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  budgetOverSpent: {
    color: '#EF4444',
  },
  budgetRemaining: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'right',
  },
  budgetNegative: {
    color: '#EF4444',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressOverBudget: {
    backgroundColor: '#EF4444',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  percentageOverBudget: {
    color: '#EF4444',
  },
  budgetPeriod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  periodText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  periodDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  categoryItem: {
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
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categorySpent: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryStats: {
    alignItems: 'flex-end',
    flex: 1,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  categoryOverBudget: {
    color: '#EF4444',
  },
  categoryProgress: {
    width: 80,
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  categoryProgressOverBudget: {
    backgroundColor: '#EF4444',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
});
