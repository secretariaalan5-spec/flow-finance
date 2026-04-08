export interface Transaction {
  id: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  categoria: string;
  descricao: string;
  data: string;
  synced: boolean;
}

const STORAGE_KEY = 'cofrinho_transactions';

export function getTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(t: Transaction): void {
  const all = getTransactions();
  all.unshift(t);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteTransaction(id: string): void {
  const all = getTransactions().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Preparação para sincronização futura
export async function syncTransactions(): Promise<void> {
  const unsynced = getTransactions().filter(t => !t.synced);
  if (unsynced.length === 0) return;
  // Estrutura pronta para envio via fetch()
  // await fetch('/api/transactions', { method: 'POST', body: JSON.stringify(unsynced) });
  console.log('Preparado para sincronizar:', unsynced.length, 'transações');
}
