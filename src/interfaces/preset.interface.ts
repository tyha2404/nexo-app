import { TransactionType } from './transaction.interface';

export interface Preset {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  amount: number;
  type: TransactionType;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export interface CreatePresetDTO {
  categoryId: string;
  name: string;
  amount: number;
  type: TransactionType;
  description?: string;
  icon?: string;
  sortOrder?: number;
}
