import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

function formatCurrency(v: number) {
  const formatted = Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [int, dec] = formatted.split(',');
  return { int: `${v < 0 ? '-' : ''}${int}`, dec };
}

export default function BalanceCards() {
  const { balance, totalIncome, totalExpense } = useTransactions();
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const isHealthy = balance >= 0 && totalIncome >= totalExpense;

  const main = formatCurrency(balance);
  const inc = formatCurrency(totalIncome);
  const exp = formatCurrency(totalExpense);

  return (
    <div className="space-y-3">
      {/* Saldo principal — estilo editorial */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="quiet-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Saldo Atual</p>
            <p className="text-[10px] text-muted-foreground/70 capitalize mt-0.5">{monthName}</p>
          </div>
          {isHealthy && (
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              <TrendingUp className="w-3 h-3" /> Saudável
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-muted-foreground">R$</span>
          <span className="number-display text-5xl font-normal text-foreground">{main.int}</span>
          <span className="number-display text-xl text-muted-foreground">,{main.dec}</span>
        </div>
      </motion.div>

      {/* Receitas e Despesas */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="quiet-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Receitas</span>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] text-muted-foreground">R$</span>
            <span className="number-display text-2xl text-foreground">{inc.int}</span>
            <span className="number-display text-xs text-muted-foreground">,{inc.dec}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="quiet-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Despesas</span>
            <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] text-muted-foreground">R$</span>
            <span className="number-display text-2xl text-foreground">{exp.int}</span>
            <span className="number-display text-xs text-muted-foreground">,{exp.dec}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
