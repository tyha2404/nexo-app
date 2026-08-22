import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react-native';
import { costService } from '@/services';
import { Cost } from '@/interfaces';
import moment from 'moment';

const { width } = Dimensions.get('window');

interface ExpenseData {
  month: string;
  amount: number;
  categories: { [key: string]: number };
}

interface CategorySpending {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

const SAMPLE_DATA: ExpenseData[] = [
  {
    month: 'Jan 2024',
    amount: 1250,
    categories: {
      'Food & Dining': 320,
      Transportation: 150,
      Shopping: 280,
      Entertainment: 90,
      'Bills & Utilities': 380,
      Healthcare: 30,
    },
  },
  {
    month: 'Feb 2024',
    amount: 1180,
    categories: {
      'Food & Dining': 295,
      Transportation: 140,
      Shopping: 250,
      Entertainment: 110,
      'Bills & Utilities': 365,
      Healthcare: 20,
    },
  },
  {
    month: 'Mar 2024',
    amount: 1420,
    categories: {
      'Food & Dining': 380,
      Transportation: 180,
      Shopping: 320,
      Entertainment: 150,
      'Bills & Utilities': 370,
      Healthcare: 20,
    },
  },
  {
    month: 'Apr 2024',
    amount: 1380,
    categories: {
      'Food & Dining': 350,
      Transportation: 160,
      Shopping: 300,
      Entertainment: 120,
      'Bills & Utilities': 380,
      Healthcare: 70,
    },
  },
  {
    month: 'May 2024',
    amount: 1320,
    categories: {
      'Food & Dining': 320,
      Transportation: 150,
      Shopping: 280,
      Entertainment: 90,
      'Bills & Utilities': 380,
      Healthcare: 100,
    },
  },
  {
    month: 'Jun 2024',
    amount: 1465,
    categories: {
      'Food & Dining': 320,
      Transportation: 150,
      Shopping: 280,
      Entertainment: 90,
      'Bills & Utilities': 380,
      Healthcare: 245,
    },
  },
];

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food & Dining': '#EF4444',
  Transportation: '#3B82F6',
  Shopping: '#8B5CF6',
  Entertainment: '#F59E0B',
  'Bills & Utilities': '#10B981',
  Healthcare: '#EC4899',
};

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>(
    'month'
  );
  const [loading, setLoading] = useState(true);
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchExpenseData();
    }, [selectedPeriod])
  );

  // Fetch expense data from API
  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = moment();
      let startDate: string;
      let endDate: string;

      if (selectedPeriod === 'month') {
        // Get data for the last 6 months including current month
        startDate = now
          .clone()
          .subtract(5, 'months')
          .startOf('month')
          .format('YYYY-MM-DD');
        endDate = now.endOf('month').format('YYYY-MM-DD');
      } else {
        // Get data for the current year
        startDate = now.clone().startOf('year').format('YYYY-MM-DD');
        endDate = now.endOf('year').format('YYYY-MM-DD');
      }

      const response = await costService.getAll({
        startDate,
        endDate,
        limit: 1000,
      });

      // Handle both 'list' and 'items' properties in API response
      const costsList = response.list || response.items || [];
      setCosts(costsList);
      const transformedData = transformCostDataToExpenseData(costsList);
      setExpenseData(transformedData);
    } catch (err) {
      console.error('Error fetching expense data:', err);
      setError('Failed to load expense data');
      Alert.alert('Error', 'Failed to load expense data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Transform Cost API data to ExpenseData format
  const transformCostDataToExpenseData = (costs: Cost[]): ExpenseData[] => {
    const monthlyData: { [key: string]: ExpenseData } = {};

    costs.forEach((cost) => {
      const monthKey = moment(cost.incurredAt).format('MMM YYYY');

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          amount: 0,
          categories: {},
        };
      }

      monthlyData[monthKey].amount += cost.amount;

      const categoryName = cost.Category?.name || 'Uncategorized';
      monthlyData[monthKey].categories[categoryName] =
        (monthlyData[monthKey].categories[categoryName] || 0) + cost.amount;
    });

    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => {
      return moment(a.month, 'MMM YYYY').diff(moment(b.month, 'MMM YYYY'));
    });
  };

  const currentMonth =
    expenseData.length > 0 ? expenseData[expenseData.length - 1] : null;
  const previousMonth =
    expenseData.length > 1 ? expenseData[expenseData.length - 2] : null;
  const monthlyChange =
    currentMonth && previousMonth
      ? currentMonth.amount - previousMonth.amount
      : 0;
  const monthlyChangePercentage =
    previousMonth && previousMonth.amount > 0
      ? ((monthlyChange / previousMonth.amount) * 100).toFixed(1)
      : '0';

  const yearlyTotal = expenseData.reduce((sum, month) => sum + month.amount, 0);
  const monthlyAverage =
    expenseData.length > 0 ? yearlyTotal / expenseData.length : 0;

  const averageDailySpending = useMemo(() => {
    const now = moment();
    const start = now.clone().startOf('month');
    const end = now.clone().endOf('month');
    const included = costs.filter(
      (cost) =>
        !cost.Category?.excludeFromAverageDaily &&
        moment(cost.incurredAt).isBetween(start, end, null, '[]')
    );
    const total = included.reduce((sum, cost) => sum + cost.amount, 0);
    return total / now.daysInMonth();
  }, [costs]);

  const getCategorySpending = (): CategorySpending[] => {
    const categoryTotals: { [key: string]: number } = {};

    if (selectedPeriod === 'month' && currentMonth) {
      Object.entries(currentMonth.categories).forEach(([category, amount]) => {
        categoryTotals[category] = amount;
      });
    } else {
      expenseData.forEach((month) => {
        Object.entries(month.categories).forEach(([category, amount]) => {
          categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });
      });
    }

    const total = Object.values(categoryTotals).reduce(
      (sum, amount) => sum + amount,
      0
    );

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORY_COLORS[name] || '#6B7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categorySpending = getCategorySpending();
  const maxAmount =
    expenseData.length > 0 ? Math.max(...expenseData.map((d) => d.amount)) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Analyze your spending patterns</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchExpenseData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : expenseData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expense data available</Text>
          <Text style={styles.emptySubtext}>
            Add some expenses to see your reports
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive,
                ]}
              >
                This Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'year' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('year')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'year' && styles.periodButtonTextActive,
                ]}
              >
                This Year
              </Text>
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <DollarSign size={24} color="#10B981" />
              </View>
              <Text style={styles.summaryAmount}>
                $
                {selectedPeriod === 'month' && currentMonth
                  ? currentMonth.amount.toFixed(2)
                  : yearlyTotal.toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>
                {selectedPeriod === 'month' ? 'This Month' : 'This Year'}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor: monthlyChange >= 0 ? '#FEF2F2' : '#F0FDF4',
                  },
                ]}
              >
                {monthlyChange >= 0 ? (
                  <TrendingUp size={24} color="#EF4444" />
                ) : (
                  <TrendingDown size={24} color="#10B981" />
                )}
              </View>
              <Text style={styles.summaryAmount}>
                {monthlyChange >= 0 ? '+' : ''}$
                {Math.abs(monthlyChange).toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>vs Last Month</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Calendar size={24} color="#3B82F6" />
              </View>
              <Text style={styles.summaryAmount}>
                ${monthlyAverage.toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Monthly Average</Text>
            </View>
          </View>

          {/* Monthly Spending Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Monthly Spending</Text>
            <View style={styles.chart}>
              {expenseData.slice(-6).map((data, index) => {
                const height = (data.amount / maxAmount) * 120;
                return (
                  <View key={data.month} style={styles.chartBar}>
                    <Text style={styles.chartAmount}>
                      ${Math.round(data.amount)}
                    </Text>
                    <View style={[styles.bar, { height }]} />
                    <Text style={styles.chartMonth}>
                      {data.month.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>
              Category Breakdown -{' '}
              {selectedPeriod === 'month' ? 'This Month' : 'This Year'}
            </Text>
            {categorySpending.map((category, index) => (
              <View key={category.name} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryAmount}>
                    ${category.amount.toFixed(2)}
                  </Text>
                  <Text style={styles.categoryPercentage}>
                    {category.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Insights */}
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {categorySpending.length > 0 && (
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  Your top spending category this month is{' '}
                  <Text style={styles.insightHighlight}>
                    {categorySpending[0]?.name}
                  </Text>{' '}
                  at ${categorySpending[0]?.amount.toFixed(2)}.
                </Text>
              </View>
            )}
            {previousMonth && (
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  You spent {monthlyChangePercentage}%{' '}
                  {monthlyChange >= 0 ? 'more' : 'less'} compared to last month.
                </Text>
              </View>
            )}
            {currentMonth && (
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  Your average daily spending this month is $
                  {(averageDailySpending ?? 0).toFixed(2)}.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 24,
    marginBottom: 0,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#111827',
  },
  summarySection: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartSection: {
    margin: 24,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  chartAmount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  bar: {
    backgroundColor: '#10B981',
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 4,
  },
  chartMonth: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  categorySection: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  categoryName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  insightsSection: {
    margin: 24,
    marginTop: 0,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  insightHighlight: {
    fontWeight: '600',
    color: '#10B981',
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
    paddingHorizontal: 24,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
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
});
