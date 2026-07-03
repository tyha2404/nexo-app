import { AxiosInstance } from 'axios';
import { CRUDService } from './crud.service';
import restConnector from '../connectors/axios-rest-connector';
import { Salary } from '@/interfaces';

export class SalaryService extends CRUDService<Salary> {
  private salarySubPath: string;

  constructor(options: { restConnector: AxiosInstance }) {
    super({ restConnector: options.restConnector, subPath: '/salaries' });
    this.salarySubPath = '/salaries';
  }

  async getActiveSalary(userId: string): Promise<Salary | null> {
    try {
      const { data } = await this.restConnector.get(
        `${this.salarySubPath}/active/${userId}`
      );
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to fetch active salary');
      }
      throw new Error('Failed to fetch active salary');
    }
  }

  async getNetSalary(salaryId: string): Promise<{
    grossAmount: number;
    totalDeductions: number;
    netAmount: number;
  }> {
    try {
      const { data } = await this.restConnector.get(
        `${this.salarySubPath}/${salaryId}/net`
      );
      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to calculate net salary');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to calculate net salary');
      }
      throw new Error('Failed to calculate net salary');
    }
  }
}

export const salaryService = new SalaryService({ restConnector });
