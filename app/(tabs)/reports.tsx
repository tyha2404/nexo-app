import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';

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
      'Transportation': 150,
      'Shopping': 280,
      'Entertainment': 90,
      'Bills & Utilities': 380,
      'Healthcare': 30,
    },
  },
  {
    month: 'Feb 2024',
    amount: 1180,
    categories: {
      'Food & Dining': 295,
      'Transportation': 140,
      'Shopping': 250,
      'Entertainment': 110,
      'Bills & Utilities': 365,
      'Healthcare': 20,
    },
  },
  {
    month: 'Mar 2024',
    amount: 1420,
    categories: {
      'Food & Dining': 380,
      'Transportation': 180,
      'Shopping': 320,
      'Entertainment': 150,
      'Bills & Utilities': 370,
      'Healthcare': 20,
    },
  },
  {
    month: 'Apr 2024',
    amount: 1380,
    categories: {
      'Food & Dining': 350,
      'Transportation': 160,
      'Shopping': 300,
      'Entertainment': 120,
      'Bills & Utilities': 380,
      'Healthcare': 70,
    },
  },
  {
    month: 'May 2024',
    amount: 1320,
    categories: {
      'Food & Dining': 320,
      'Transportation': 150,
      'Shopping': 280,
      'Entertainment': 90,
      'Bills & Utilities': 380,
      'Healthcare': 100,
    },
  },
  {
    month: 'Jun 2024',
    amount: 1465,
    categories: {
      'Food & Dining': 320,
      'Transportation': 150,
      'Shopping': 280,
      'Entertainment': 90,
      'Bills & Utilities': 380,
      'Healthcare': 245,
    },
  },
];

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food & Dining': '#EF4444',
  'Transportation': '#3B82F6',
  'Shopping': '#8B5CF6',
  'Entertainment': '#F59E0B',
  'Bills & Utilities': '#10B981',
  'Healthcare': '#EC4899',
};

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  const currentMonth = SAMPLE_DATA[SAMPLE_DATA.length - 1];
  const previousMonth = SAMPLE_DATA[SAMPLE_DATA.length - 2];
  const monthlyChange = currentMonth.amount - previousMonth.amount;
  const monthlyChangePercentage = ((monthlyChange / previousMonth.amount) * 100).toFixed(1);

  const yearlyTotal = SAMPLE_DATA.reduce((sum, month) => sum + month.amount, 0);
  const monthlyAverage = yearlyTotal / SAMPLE_DATA.length;

  const getCategorySpending = (): CategorySpending[] => {
    const categoryTotals: { [key: string]: number } = {};
    
    if (selectedPeriod === 'month') {
      Object.entries(currentMonth.categories).forEach(([category, amount]) => {
        categoryTotals[category] = amount;
      });
    } else {
      SAMPLE_DATA.forEach(month => {
        Object.entries(month.categories).forEach(([category, amount]) => {
          categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });
      });
    }

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / total) * 100,
        color: CATEGORY_COLORS[name] || '#6B7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categorySpending = getCategorySpending();
  const maxAmount = Math.max(...SAMPLE_DATA.map(d => d.amount));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Analyze your spending patterns</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'year' && styles.periodButtonTextActive]}>
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
              ${selectedPeriod === 'month' ? currentMonth.amount.toFixed(2) : yearlyTotal.toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>
              {selectedPeriod === 'month' ? 'This Month' : 'This Year'}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: monthlyChange >= 0 ? '#FEF2F2' : '#F0FDF4' }]}>
              {monthlyChange >= 0 ? (
                <TrendingUp size={24} color="#EF4444" />
              ) : (
                <TrendingDown size={24} color="#10B981" />
              )}
            </View>
            <Text style={styles.summaryAmount}>
              {monthlyChange >= 0 ? '+' : ''}${Math.abs(monthlyChange).toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>vs Last Month</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Calendar size={24} color="#3B82F6" />
            </View>
            <Text style={styles.summaryAmount}>${monthlyAverage.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Monthly Average</Text>
          </View>
        </View>

        {/* Monthly Spending Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Monthly Spending</Text>
          <View style={styles.chart}>
            {SAMPLE_DATA.slice(-6).map((data, index) => {
              const height = (data.amount / maxAmount) * 120;
              return (
                <View key={data.month} style={styles.chartBar}>
                  <Text style={styles.chartAmount}>${Math.round(data.amount)}</Text>
                  <View style={[styles.bar, { height }]} />
                  <Text style={styles.chartMonth}>{data.month.split(' ')[0]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>
            Category Breakdown - {selectedPeriod === 'month' ? 'This Month' : 'This Year'}
          </Text>
          {categorySpending.map((category, index) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
                <Text style={styles.categoryPercentage}>{category.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Your top spending category this month is <Text style={styles.insightHighlight}>{categorySpending[0]?.name}</Text> at ${categorySpending[0]?.amount.toFixed(2)}.
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              You spent {monthlyChangePercentage}% {monthlyChange >= 0 ? 'more' : 'less'} compared to last month.
            </Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightText}>
              Your average daily spending this month is ${(currentMonth.amount / 30).toFixed(2)}.
            </Text>
          </View>
        </View>
      </ScrollView>
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
});