import { Category } from './category.interface';

export interface Cost {
  id: string;
  amount: number;
  title: string;
  categoryId: string;
  Category: Category;
  currency: string;
  incurredAt?: string;
}

export type CostFormData = {
  title: string;
  amount: string;
  currency: string;
  categoryId: string;
  incurredAt: Date;
};
