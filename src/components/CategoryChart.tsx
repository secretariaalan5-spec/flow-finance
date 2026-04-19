import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { getCategoryEmoji } from '@/lib/categories';

const SHADES = [
  'hsl(145 45% 38%)',
  'hsl(145 35% 50%)',
  'hsl(42 50% 58%)',
  'hsl(35 40% 50%)',
  'hsl(150 25% 28%)',
  'hsl(8 50% 55%)',
  'hsl(180 30% 40%)',
  'hsl(60 25% 55%)',
];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CategoryChart() {
  const { categoryTotals } = useTransactions();
  const entries = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="quiet-card p-5"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">
          Distribuição
        </p>
        <p className="text-muted-foreground/70 text-sm">Sem despesas registradas este mês.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="quiet-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Distribuição
        </p>
        <span className="text-[10px] text-muted-foreground">{entries.length} categorias</span>
      </div>

      {/* Barra horizontal segmentada */}
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-5 bg-muted/30">
        {entries.map(([name, value], i) => (
          <div
            key={name}
            style={{ width: `${(value / total) * 100}%`, background: SHADES[i % SHADES.length] }}
            title={`${name}: R$ ${formatCurrency(value)}`}
          />
        ))}
      </div>

      {/* Lista de categorias */}
      <div className="space-y-3">
        {entries.slice(0, 5).map(([name, value], i) => {
          const pct = ((value / total) * 100).toFixed(0);
          return (
            <div key={name} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: SHADES[i % SHADES.length] }}
              />
              <span className="text-sm flex-1 text-foreground">
                {getCategoryEmoji(name)} {name}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{pct}%</span>
              <span className="number-display text-sm text-foreground tabular-nums w-20 text-right">
                {formatCurrency(value)}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
