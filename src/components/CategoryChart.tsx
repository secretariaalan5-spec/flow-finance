import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
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
  const { budgetStatuses } = useBudgets();
  
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
          Visão Geral por Categoria
        </p>
        <p className="text-muted-foreground/70 text-sm">Nenhum gasto registrado este mês. 🎉</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Maiores Gastos
        </p>
        <span className="text-[10px] text-muted-foreground">{entries.length} categorias</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {entries.slice(0, 6).map(([name, value], i) => {
          const color = colorFor(name, i);
          const budget = budgetStatuses.find(b => b.categoria === name);
          
          let progress = 0;
          let isExceeded = false;
          let isWarning = false;
          
          if (budget) {
            progress = Math.min(budget.percentual, 100);
            isExceeded = budget.status === 'exceeded';
            isWarning = budget.status === 'warning';
          } else {
            // Se não tem limite, mostra o % relativo ao total de gastos
            progress = (value / total) * 100;
          }

          return (
            <motion.div 
              key={name} 
              className="quiet-card p-4 flex flex-col relative overflow-hidden"
              whileTap={{ scale: 0.98 }}
            >
              {/* Efeito de fundo bem sutil com a cor da categoria */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{ background: color, transform: 'translate(30%, -30%)' }}
              />

              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-[0.8rem] flex items-center justify-center text-sm flex-shrink-0"
                  style={{
                    background: color.replace(')', ' / 0.15)'),
                    border: `1px solid ${color.replace(')', ' / 0.35)')}`,
                  }}
                >
                  <span>{getCategoryEmoji(name)}</span>
                </div>
                <span className="text-xs font-semibold text-foreground leading-tight line-clamp-1">{name}</span>
              </div>
              
              <div className="mt-auto">
                <span className="number-display text-lg text-foreground font-semibold leading-none block mb-2">
                  <span className="text-[10px] text-muted-foreground mr-0.5">R$</span>
                  {formatCurrency(value)}
                </span>
                
                {/* Barrinha de progresso */}
                <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.1 * i, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                      background: isExceeded 
                        ? 'hsl(0 84% 60%)' 
                        : isWarning 
                          ? 'hsl(40 90% 55%)' 
                          : budget 
                            ? 'hsl(145 65% 45%)' // Verde se tem limite e tá safe
                            : color // Cor da categoria se não tem limite
                    }}
                  />
                </div>
                {budget && (
                  <p className="text-[9px] font-medium mt-1.5" style={{ color: isExceeded ? 'hsl(0 84% 60%)' : 'var(--muted-foreground)' }}>
                    {isExceeded ? 'Estourou o limite!' : `${progress.toFixed(0)}% do limite`}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
