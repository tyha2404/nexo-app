export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INVESTMENT = 'INVESTMENT',
}

export type InvestmentStatus = 'HOLDING' | 'SOLD' | 'MATURED' | 'CANCELLED';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  walletId?: string;
  walletName?: string;
  amount: number;
  description?: string;
  type: TransactionType;
  status?: InvestmentStatus;
  realizedPnl?: number;
  receiptUrl?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}
