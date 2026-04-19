import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { getCategoryEmoji } from '@/lib/categories';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface Props {
  limit?: number;
  showFilters?: boolean;
}

export default function TransactionList({ limit, showFilters = false }: Props) {
  const { transactions, remove } = useTransactions();
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filterCat, setFilterCat] = useState('todos');

  let filtered = transactions;
  if (filterType !== 'todos') filtered = filtered.filter((t) => t.tipo === filterType);
  if (filterCat !== 'todos') filtered = filtered.filter((t) => t.categoria === filterCat);

  const display = limit ? filtered.slice(0, limit) : filtered;
  const categories = [...new Set(transactions.map((t) => t.categoria))];

  return (
    <div>
      {showFilters && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
          {(['todos', 'receita', 'despesa'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                filterType === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/40 text-muted-foreground border border-border/30'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-1.5 rounded-full text-[11px] bg-muted/40 text-muted-foreground border border-border/30 outline-none"
          >
            <option value="todos">Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {display.length === 0 ? (
        <div className="quiet-card p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhuma transação ainda.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Comece registrando um gasto acima.</p>
        </div>
      ) : (
        <div className="quiet-card overflow-hidden divide-y divide-border/30">
          <AnimatePresence>
            {display.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-4 group hover:bg-muted/20 transition-colors"
              >
                <div className="w-11 h-11 rounded-2xl bg-muted/50 border border-border/30 flex items-center justify-center text-lg flex-shrink-0">
                  {getCategoryEmoji(t.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.descricao}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t.categoria} · {formatDate(t.data)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`number-display text-lg ${t.tipo === 'receita' ? 'text-primary' : 'text-foreground'}`}>
                    {t.tipo === 'receita' ? '+' : '−'}{formatCurrency(t.valor)}
                  </span>
                  <button
                    onClick={() => {
                      remove(t.id);
                      toast('Transação removida');
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/15 text-destructive transition-all"
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
