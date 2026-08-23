export type WalletType = 'CASH' | 'BANK' | 'E_WALLET' | 'SAVINGS' | 'CREDIT' | 'JAR';
export type AllocationPreset = '50_30_20' | '6_JARS' | 'CUSTOM';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  icon?: string;
  jarCategory?: string;
  allocationPercent?: number;
  accountNumber?: string;
  bankName?: string;
  isIncludedInTotal: boolean;
  createdAt: string;
}

export interface CreateWalletDTO {
  name: string;
  type: WalletType;
  balance?: number;
  currency?: string;
  icon?: string;
  jarCategory?: string;
  allocationPercent?: number;
  accountNumber?: string;
  bankName?: string;
  isIncludedInTotal?: boolean;
}

export interface TransferMoneyDTO {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  fee?: number;
  note?: string;
  transferDate?: string;
}

export interface WalletSummaryResponse {
  totalBalance: number;
  wallets: Wallet[];
}
