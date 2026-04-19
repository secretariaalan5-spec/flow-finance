import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from 'sonner';
import { useState } from 'react';
import { getCategoryEmoji } from '@/lib/categories';
import SwipeableRow from './SwipeableRow';
import { Clock } from 'lucide-react';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return d.toLocaleDateString('pt-BR', { weekday: 'long' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Cores de fundo por tipo de transação
function getCategoryColor(tipo: 'receita' | 'despesa') {
  return tipo === 'receita'
    ? { bg: 'hsl(145 50% 88%)', border: 'hsl(145 50% 72% / 0.5)' }
    : { bg: 'hsl(30 60% 90%)', border: 'hsl(30 40% 75% / 0.4)' };
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
              className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold whitespace-nowrap transition-all tap-scale ${
                filterType === t
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground border border-border/30'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Gastos'}
            </button>
          ))}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-1.5 rounded-full text-[11px] bg-muted/40 text-muted-foreground border border-border/30 outline-none"
          >
            <option value="todos">Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {display.length === 0 ? (
        <div className="quiet-card p-10 text-center space-y-2">
          <p className="text-3xl">🐷</p>
          <p className="text-sm font-semibold text-foreground">Nenhuma transação</p>
          <p className="text-xs text-muted-foreground">Adicione algo usando o botão + abaixo</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {display.map((t, i) => {
              const colors = getCategoryColor(t.tipo);
              const isPending = (t as any)._pending;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <SwipeableRow
                    onDelete={() => {
                      remove(t.id);
                      toast('Removido', { description: `${t.descricao} excluído` });
                    }}
                  >
                    <div
                      className="flex items-center gap-3 p-3.5 rounded-[1.25rem] border"
                      style={{
                        background: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border) / 0.5)',
                        opacity: isPending ? 0.7 : 1,
                      }}
                    >
                      {/* Ícone de categoria colorido */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border"
                        style={{ background: colors.bg, borderColor: colors.border }}
                      >
                        {getCategoryEmoji(t.categoria)}
                      </div>

                      {/* Textos */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate leading-tight">
                          {t.descricao || t.categoria}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: colors.bg,
                              color: t.tipo === 'receita' ? 'hsl(145 55% 25%)' : 'hsl(25 70% 35%)',
                            }}
                          >
                            {t.categoria}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDateLabel(t.data)} · {formatTime(t.data)}
                          </span>
                        </div>
                        {isPending && (
                          <p className="text-[9px] text-amber-500 font-semibold mt-0.5">⏳ Pendente offline</p>
                        )}
                      </div>

                      {/* Valor — destaque total */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className="number-display font-semibold text-[1.05rem] leading-none"
                          style={{ color: t.tipo === 'receita' ? 'hsl(145 55% 28%)' : 'hsl(8 65% 45%)' }}
                        >
                          {t.tipo === 'receita' ? '+' : '−'}R$ {formatCurrency(t.valor)}
                        </p>
                      </div>
                    </div>
                  </SwipeableRow>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
