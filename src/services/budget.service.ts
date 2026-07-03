import { AxiosInstance } from 'axios';
import { CRUDService } from './crud.service';
import restConnector from '../connectors/axios-rest-connector';
import { Budget, BudgetCategory, BudgetSummary } from '@/interfaces';

export class BudgetService extends CRUDService<Budget> {
  private budgetSubPath: string;

  constructor(options: { restConnector: AxiosInstance }) {
    super({ restConnector: options.restConnector, subPath: '/budgets' });
    this.budgetSubPath = '/budgets';
  }

  async getActiveBudget(userId: string): Promise<Budget | null> {
    try {
      const { data } = await this.restConnector.get(
        `${this.budgetSubPath}/active/${userId}`
      );
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch active budget');
      }
      throw new Error('Failed to fetch active budget');
    }
  }

  async getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
    try {
      const { data } = await this.restConnector.get(
        `${this.budgetSubPath}/${budgetId}/summary`
      );
      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch budget summary');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch budget summary');
      }
      throw new Error('Failed to fetch budget summary');
    }
  }

  async updateCategorySpending(
    budgetId: string,
    categoryId: string
  ): Promise<void> {
    try {
      await this.restConnector.post(
        `${this.budgetSubPath}/${budgetId}/categories/${categoryId}/update-spending`
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to update category spending');
      }
      throw new Error('Failed to update category spending');
    }
  }
}

export const budgetService = new BudgetService({ restConnector });
