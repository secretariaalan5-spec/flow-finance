import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useTransactions } from './useTransactions';

export interface BudgetLimit {
  id: string;
  user_id: string;
  categoria: string;
  limite: number;
}

export interface BudgetStatus {
  categoria: string;
  limite: number;
  gasto: number;
  percentual: number;          // 0–100+
  status: 'ok' | 'warning' | 'exceeded'; // <70% | 70–100% | >100%
}

export function useBudgets() {
  const { user } = useAuth();
  const { categoryTotals } = useTransactions();
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    if (!user) { setBudgets([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('budget_limits')
      .select('*')
      .eq('user_id', user.id)
      .order('categoria');
    if (data) setBudgets(data as BudgetLimit[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  // ─── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channelName = `budgets-${user.id}-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budget_limits', filter: `user_id=eq.${user.id}` },
        () => fetchBudgets()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchBudgets]);

  // Upsert: cria ou atualiza o limite de uma categoria
  const upsert = useCallback(async (categoria: string, limite: number) => {
    if (!user) return;
    const { data } = await supabase
      .from('budget_limits')
      .upsert({ user_id: user.id, categoria, limite }, { onConflict: 'user_id,categoria' })
      .select()
      .single();
    if (data) {
      setBudgets(prev => {
        const exists = prev.find(b => b.categoria === categoria);
        return exists
          ? prev.map(b => b.categoria === categoria ? (data as BudgetLimit) : b)
          : [...prev, data as BudgetLimit];
      });
    }
  }, [user]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('budget_limits').delete().eq('id', id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  // Cruza limites com gastos reais do mês
  const budgetStatuses: BudgetStatus[] = budgets.map(b => {
    const gasto = categoryTotals[b.categoria] ?? 0;
    const percentual = (gasto / b.limite) * 100;
    const status = percentual >= 100 ? 'exceeded' : percentual >= 70 ? 'warning' : 'ok';
    return { categoria: b.categoria, limite: b.limite, gasto, percentual, status };
  });

  const exceeded  = budgetStatuses.filter(b => b.status === 'exceeded');
  const warnings  = budgetStatuses.filter(b => b.status === 'warning');

  // Dispara push notifications limitadas para limites estourados
  useEffect(() => {
    exceeded.forEach(b => {
      import('@/lib/notifications').then(({ notifyBudgetExceeded }) => {
        notifyBudgetExceeded(b.categoria);
      });
    });
  }, [JSON.stringify(exceeded.map(e => e.categoria))]);

  return { budgets, budgetStatuses, exceeded, warnings, loading, upsert, remove, refetch: fetchBudgets };
}
