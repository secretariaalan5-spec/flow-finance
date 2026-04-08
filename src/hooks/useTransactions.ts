import { useState, useCallback, useSyncExternalStore } from 'react';
import { getTransactions, saveTransaction, deleteTransaction, type Transaction } from '@/lib/storage';

let listeners: (() => void)[] = [];
function emitChange() {
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => { listeners = listeners.filter(l => l !== listener); };
}

export function useTransactions() {
  const transactions = useSyncExternalStore(subscribe, getTransactions, getTransactions);

  const add = useCallback((t: Transaction) => {
    saveTransaction(t);
    emitChange();
  }, []);

  const remove = useCallback((id: string) => {
    deleteTransaction(id);
    emitChange();
  }, []);

  const now = new Date();
  const currentMonth = transactions.filter(t => {
    const d = new Date(t.data);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = currentMonth.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const totalExpense = currentMonth.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
  const balance = totalIncome - totalExpense;

  const categoryTotals = currentMonth
    .filter(t => t.tipo === 'despesa')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  return { transactions, currentMonth, add, remove, totalIncome, totalExpense, balance, categoryTotals };
}
