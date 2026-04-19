import { motion } from 'framer-motion';
import { useBudgets } from '@/hooks/useBudgets';
import { AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { getCategoryEmoji } from '@/lib/categories';

interface Props {
  onManage?: () => void;
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BudgetBars({ onManage }: Props) {
  const { budgetStatuses, loading } = useBudgets();

  if (loading) return null;
  if (budgetStatuses.length === 0) return null;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Limites do Mês
        </p>
        {onManage && (
          <button
            onClick={onManage}
            className="flex items-center gap-0.5 text-[11px] text-primary font-semibold tap-scale"
          >
            Gerenciar <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {budgetStatuses.map((b, i) => {
          const barWidth = Math.min(b.percentual, 100);
          const barColor =
            b.status === 'exceeded' ? 'hsl(8 70% 52%)' :
            b.status === 'warning'  ? 'hsl(35 85% 52%)' :
                                      'hsl(145 55% 40%)';
          const bgColor =
            b.status === 'exceeded' ? 'hsl(8 80% 96%)' :
            b.status === 'warning'  ? 'hsl(35 85% 96%)' :
                                      'hsl(var(--card))';
          const borderColor =
            b.status === 'exceeded' ? 'hsl(8 60% 85%)' :
            b.status === 'warning'  ? 'hsl(35 70% 82%)' :
                                      'hsl(var(--border) / 0.5)';

          const StatusIcon =
            b.status === 'exceeded' ? XCircle :
            b.status === 'warning'  ? AlertTriangle :
                                      CheckCircle;

          return (
            <motion.div
              key={b.categoria}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-3.5 border"
              style={{ background: bgColor, borderColor }}
            >
              {/* Linha superior */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-lg">{getCategoryEmoji(b.categoria)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{b.categoria}</p>
                    <StatusIcon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: barColor }}
                    />
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-bold" style={{ color: barColor }}>
                        R$ {formatCurrency(b.gasto)}
                      </span>
                      {' '}/ R$ {formatCurrency(b.limite)}
                    </p>
                    <p
                      className="text-[11px] font-bold"
                      style={{ color: barColor }}
                    >
                      {b.status === 'exceeded'
                        ? `+R$ ${formatCurrency(b.gasto - b.limite)} acima`
                        : `${Math.round(b.percentual)}%`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted) / 0.5)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: barColor }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
