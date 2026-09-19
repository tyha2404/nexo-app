import { useEffect } from 'react';
import { supabase } from '../config/supabase';

export interface UseRealtimeSyncProps {
  userId?: string;
  onTransactionChange?: () => void;
  onWalletChange?: () => void;
  onBudgetChange?: () => void;
  onDebtChange?: () => void;
}

export function useRealtimeSync(props?: UseRealtimeSyncProps) {
  const { userId, onTransactionChange, onWalletChange, onBudgetChange, onDebtChange } = props || {};

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-sync-mobile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (onTransactionChange) {
            onTransactionChange();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (onWalletChange) {
            onWalletChange();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (onBudgetChange) {
            onBudgetChange();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debts',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (onDebtChange) {
            onDebtChange();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onTransactionChange, onWalletChange, onBudgetChange, onDebtChange]);
}
