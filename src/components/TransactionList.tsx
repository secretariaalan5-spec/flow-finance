import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

import { getCategoryEmoji } from '@/lib/categories';

interface Props {
  limit?: number;
  showFilters?: boolean;
}

export default function TransactionList({ limit, showFilters = false }: Props) {
  const { transactions, remove } = useTransactions();
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filterCat, setFilterCat] = useState('todos');

  let filtered = transactions;
  if (filterType !== 'todos') filtered = filtered.filter(t => t.tipo === filterType);
  if (filterCat !== 'todos') filtered = filtered.filter(t => t.categoria === filterCat);

  const display = limit ? filtered.slice(0, limit) : filtered;
  const categories = [...new Set(transactions.map(t => t.categoria))];

  return (
    <div>
      {showFilters && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['todos', 'receita', 'despesa'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-muted text-muted-foreground outline-none"
          >
            <option value="todos">Categorias</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {display.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Nenhuma transação encontrada</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {display.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-3 flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                  {CATEGORY_EMOJI[t.categoria] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.descricao}</p>
                  <p className="text-xs text-muted-foreground">{t.categoria} • {formatDate(t.data)}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className={`text-sm font-heading font-bold ${t.tipo === 'receita' ? 'text-income' : 'text-expense'}`}>
                    {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                  </span>
                  <button
                    onClick={() => {
                      remove(t.id);
                      toast('Transação removida');
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
