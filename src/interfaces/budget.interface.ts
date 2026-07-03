import { BaseCommonType } from './base-common.interface';
import { User } from './user.interface';

export interface Budget extends BaseCommonType {
  userId: string;
  user: User;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'weekly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  categories: BudgetCategory[];
}

export interface BudgetCategory extends BaseCommonType {
  budgetId: string;
  categoryId: string;
  allocatedAmount: number;
  spentAmount: number;
  percentage: number;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface Salary extends BaseCommonType {
  userId: string;
  user: User;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'bi-weekly';
  nextPayDate: string;
  isActive: boolean;
  deductions?: SalaryDeduction[];
}

export interface SalaryDeduction extends BaseCommonType {
  salaryId: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
  percentage?: number;
}

export interface BudgetFormData {
  name: string;
  description?: string | undefined;
  amount: string;
  currency: string;
  period: 'monthly' | 'yearly' | 'weekly';
  startDate: Date;
  endDate: Date;
  categories: CategoryBudgetAllocation[];
}

export interface CategoryBudgetAllocation {
  categoryId: string;
  allocatedAmount: string;
}

export interface SalaryFormData {
  amount: string;
  currency: string;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'bi-weekly';
  nextPayDate: Date;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  categories: BudgetCategory[];
}
