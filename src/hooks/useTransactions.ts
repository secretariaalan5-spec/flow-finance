import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { enqueue, getQueue, dequeue, PendingTransaction } from '@/lib/offlineQueue';
import { useSelectedMonth } from '@/lib/dateStore';

// Unique ID per hook instance (avoids Supabase channel name collision in StrictMode)
let channelCounter = 0;

export interface Transaction {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  categoria: string;
  descricao: string;
  data: string;
  created_at: string;
  _pending?: boolean; // transação local ainda não sincronizada
}

export interface NewTransaction {
  tipo: 'receita' | 'despesa';
  valor: number;
  categoria: string;
  descricao?: string;
  data?: string;
}

function generateLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Global state
let globalTransactions: Transaction[] = [];
let globalLoading = true;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

export function useTransactions() {
  const { user } = useAuth();
  
  // Força re-render quando a store atualizar
  const [, setTick] = useState(0);

  const transactions = globalTransactions;
  const loading = globalLoading;

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const channelIdRef = useRef(`tx-${++channelCounter}`);

  // ─── Fetch do Supabase ───────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!user) { globalTransactions = []; globalLoading = false; notify(); return; }
    
    // Mostramos loading apenas na primeira carga
    if (globalTransactions.length === 0) {
      globalLoading = true;
      notify();
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('data', { ascending: false });

    if (!error && data) {
      // Mescla remotas com pendentes locais que ainda não foram confirmadas
      const pending = await getQueue();
      const pendingTx: Transaction[] = pending
        .filter(p => p.action === 'insert' && p.user_id === user.id)
        .map(p => ({
          id: p.localId,
          user_id: p.user_id,
          tipo: p.tipo,
          valor: p.valor,
          categoria: p.categoria,
          descricao: p.descricao,
          data: p.data,
          created_at: p.created_at,
          _pending: true,
        }));

      // Remove duplicatas (localId pode ter sido confirmado)
      const remoteIds = new Set((data as Transaction[]).map(t => t.id));
      const stillPending = pendingTx.filter(p => !remoteIds.has(p.id));

      globalTransactions = [...stillPending, ...(data as Transaction[])];
    }
    globalLoading = false;
    notify();
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ─── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channelName = channelIdRef.current;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => fetchTransactions()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchTransactions]);

  // ─── Sincronização automática quando voltar online ───────────────────────────
  const syncQueue = useCallback(async () => {
    if (!user || !navigator.onLine) return;
    const pending = await getQueue();
    if (pending.length === 0) return;

    for (const item of pending) {
      try {
        if (item.action === 'insert') {
          const { error } = await supabase.from('transactions').insert({
            tipo: item.tipo,
            valor: item.valor,
            categoria: item.categoria,
            descricao: item.descricao,
            data: item.data,
            user_id: item.user_id,
          });
          if (!error) await dequeue(item.localId);
        } else if (item.action === 'delete' && item.remoteId) {
          const { error } = await supabase.from('transactions').delete().eq('id', item.remoteId);
          if (!error) await dequeue(item.localId);
        }
      } catch {
        // Mantém na fila para próxima tentativa
      }
    }
    fetchTransactions();
  }, [user, fetchTransactions]);

  useEffect(() => {
    // Sincroniza quando reconectar
    window.addEventListener('online', syncQueue);
    // Também tenta ao montar (caso tenha pendências de sessões anteriores)
    syncQueue();
    return () => window.removeEventListener('online', syncQueue);
  }, [syncQueue]);

  // ─── Adicionar transação ─────────────────────────────────────────────────────
  const add = useCallback(async (t: NewTransaction) => {
    if (!user) return;

    const now = new Date().toISOString();
    const localId = generateLocalId();

    // Otimistic update imediato
    const optimistic: Transaction = {
      id: localId,
      user_id: user.id,
      tipo: t.tipo,
      valor: t.valor,
      categoria: t.categoria,
      descricao: t.descricao ?? '',
      data: t.data ?? now,
      created_at: now,
      _pending: !navigator.onLine,
    };
    globalTransactions = [optimistic, ...globalTransactions];
    notify();

    if (!navigator.onLine) {
      // Guarda na fila offline
      const pending: PendingTransaction = {
        localId,
        user_id: user.id,
        tipo: t.tipo,
        valor: t.valor,
        categoria: t.categoria,
        descricao: t.descricao ?? '',
        data: t.data ?? now,
        created_at: now,
        action: 'insert',
      };
      await enqueue(pending);
      return;
    }

    // Online: salva no Supabase
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...t, user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      // Substitui o otimístico pelo confirmado
      globalTransactions = globalTransactions.map(tx => tx.id === localId ? (data as Transaction) : tx);
      notify();
    } else {
      // Falhou mesmo online — move para fila
      const pending: PendingTransaction = {
        localId,
        user_id: user.id,
        tipo: t.tipo,
        valor: t.valor,
        categoria: t.categoria,
        descricao: t.descricao ?? '',
        data: t.data ?? now,
        created_at: now,
        action: 'insert',
      };
      await enqueue(pending);
    }
  }, [user]);

  const remove = useCallback(async (id: string) => {
    // Remove visualmente imediatamente
    globalTransactions = globalTransactions.filter(t => t.id !== id);
    notify();

    // Se era uma transação local pendente, remove da fila
    if (id.startsWith('local_')) {
      await dequeue(id);
      return;
    }

    if (!navigator.onLine) {
      // Guarda delete para sincronizar depois
      await enqueue({
        localId: generateLocalId(),
        user_id: '',
        tipo: 'despesa',
        valor: 0,
        categoria: '',
        descricao: '',
        data: '',
        created_at: '',
        action: 'delete',
        remoteId: id,
      });
      return;
    }

    await supabase.from('transactions').delete().eq('id', id);
  }, []);

  // ─── Cálculos do mês atual ───────────────────────────────────────────────────
  const selectedMonth = useSelectedMonth();
  const currentMonth = transactions.filter(t => {
    const d = new Date(t.data);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });

  const totalIncome  = currentMonth.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const totalExpense = currentMonth.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
  const balance = totalIncome - totalExpense;

  const categoryTotals = currentMonth
    .filter(t => t.tipo === 'despesa')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  return { transactions, currentMonth, loading, add, remove, totalIncome, totalExpense, balance, categoryTotals, refetch: fetchTransactions };
}
