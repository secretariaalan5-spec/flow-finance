import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { getCategoryEmoji } from '@/lib/categories';

// Paleta vibrante — uma cor por categoria
const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': 'hsl(15 80% 58%)',
  'Transporte':  'hsl(220 70% 60%)',
  'Mercado':     'hsl(145 55% 45%)',
  'Moradia':     'hsl(265 55% 60%)',
  'Contas':      'hsl(45 85% 55%)',
  'Lazer':       'hsl(330 70% 60%)',
  'Compras':     'hsl(195 70% 50%)',
  'Saúde':       'hsl(170 60% 45%)',
  'Educação':    'hsl(280 55% 55%)',
  'Assinaturas': 'hsl(25 80% 55%)',
  'Outros':      'hsl(220 10% 55%)',
};

const FALLBACK_SHADES = [
  'hsl(15 80% 58%)', 'hsl(220 70% 60%)', 'hsl(145 55% 45%)',
  'hsl(265 55% 60%)', 'hsl(45 85% 55%)', 'hsl(330 70% 60%)',
  'hsl(195 70% 50%)', 'hsl(170 60% 45%)',
];

function colorFor(name: string, idx: number) {
  return CATEGORY_COLORS[name] ?? FALLBACK_SHADES[idx % FALLBACK_SHADES.length];
}

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
      <div className="flex w-full h-3 rounded-full overflow-hidden mb-5 bg-muted/30 shadow-inner">
        {entries.map(([name, value], i) => (
          <motion.div
            key={name}
            initial={{ width: 0 }}
            animate={{ width: `${(value / total) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 + (i * 0.1), ease: [0.22, 1, 0.36, 1] }}
            style={{ background: colorFor(name, i) }}
            title={`${name}: R$ ${formatCurrency(value)}`}
          />
        ))}
      </div>

      {/* Lista de categorias coloridas */}
      <div className="space-y-2.5">
        {entries.slice(0, 5).map(([name, value], i) => {
          const pct = ((value / total) * 100).toFixed(0);
          const color = colorFor(name, i);
          return (
            <div key={name} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
                style={{
                  background: color.replace(')', ' / 0.15)'),
                  border: `1px solid ${color.replace(')', ' / 0.35)')}`,
                }}
              >
                <span>{getCategoryEmoji(name)}</span>
              </div>
              <span className="text-sm flex-1 text-foreground font-medium">{name}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums font-semibold">{pct}%</span>
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
