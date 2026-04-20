import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function formatCurrency(v: number) {
  const formatted = Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [int, dec] = formatted.split(',');
  return { int: `${v < 0 ? '-' : ''}${int}`, dec };
}

function formatShort(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace('.', ',')}k`;
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BalanceCards() {
  const { balance, totalIncome, totalExpense, currentMonth, loading } = useTransactions();
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const isHealthy = balance >= 0;

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const expenseProgress = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;

  const incomeCount  = currentMonth.filter(t => t.tipo === 'receita').length;
  const expenseCount = currentMonth.filter(t => t.tipo === 'despesa').length;

  const main = formatCurrency(balance);

  // Skeleton de loading
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-48 rounded-[2rem] bg-muted/30 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 rounded-[1.5rem] bg-muted/30 animate-pulse" />
          <div className="h-28 rounded-[1.5rem] bg-muted/30 animate-pulse" style={{ animationDelay: '80ms' }} />
        </div>
      </div>
    );
  }

  const healthColor = isHealthy
    ? 'linear-gradient(145deg, hsl(150 58% 26%) 0%, hsl(155 65% 20%) 60%, hsl(160 55% 14%) 100%)'
    : 'linear-gradient(145deg, hsl(8 70% 38%) 0%, hsl(10 60% 28%) 100%)';

  const healthShadow = isHealthy
    ? '0 24px 60px -16px hsl(150 55% 15% / 0.6), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)'
    : '0 24px 60px -16px hsl(8 55% 15% / 0.6), inset 0 1px 0 0 hsl(0 0% 100% / 0.12)';

  const barColor = expenseProgress > 80
    ? 'hsl(8 85% 65%)'
    : expenseProgress > 60
    ? 'hsl(35 90% 65%)'
    : 'hsl(0 0% 100% / 0.7)';

  return (
    <div className="space-y-3">
      {/* ── CARD PRINCIPAL ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] p-6 text-primary-foreground"
        style={{ background: healthColor, boxShadow: healthShadow }}
      >
        {/* Decoração de fundo */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full opacity-10" style={{ background: 'hsl(0 0% 100%)' }} />
        <div className="absolute -right-2 -bottom-6 w-32 h-32 rounded-full opacity-[0.07]" style={{ background: 'hsl(42 80% 70%)' }} />

        {/* Topo */}
        <div className="relative flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="w-3.5 h-3.5 opacity-60" />
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold opacity-70">O Que Sobrou</p>
            </div>
            <p className="text-[10px] capitalize opacity-50">{monthName}</p>
          </div>

          {/* Pill de taxa de poupança */}
          <span
            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full border whitespace-nowrap"
            style={{ background: 'hsl(0 0% 100% / 0.12)', borderColor: 'hsl(0 0% 100% / 0.18)' }}
          >
            {isHealthy
              ? <><TrendingUp className="w-3 h-3" /> {savingsRate}% na conta</>
              : <><TrendingDown className="w-3 h-3" /> Faltando!</>
            }
          </span>
        </div>

        {/* Valor — grande e legível */}
        <div className="relative mb-5">
          <div className="flex items-end gap-1 leading-none">
            <span className="text-sm opacity-50 mb-1">R$</span>
            <span
              className="number-display font-medium"
              style={{ fontSize: 'clamp(2.6rem, 10vw, 3.5rem)', letterSpacing: '-0.03em' }}
            >
              {main.int}
            </span>
            <span className="number-display text-2xl opacity-60 mb-1">,{main.dec}</span>
          </div>
        </div>

        {/* Barra de progresso gasto/receita */}
        {totalIncome > 0 && (
          <div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(0 0% 100% / 0.15)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${expenseProgress}%` }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: barColor }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] opacity-40">Começo do mês</span>
              <span className="text-[9px] opacity-60 font-semibold">Já gastou {Math.round(expenseProgress)}% do salário</span>
              <span className="text-[9px] opacity-40">Fim</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── RECEITAS + DESPESAS ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Receitas */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.3 }}
          className="relative overflow-hidden rounded-[1.5rem] p-4"
          style={{
            background: 'linear-gradient(155deg, hsl(145 50% 90%) 0%, hsl(145 58% 83%) 100%)',
            border: '1px solid hsl(145 40% 72% / 0.6)',
            boxShadow: '0 8px 24px -12px hsl(145 50% 25% / 0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(145 60% 35%)' }}>
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] uppercase tracking-[0.12em] font-bold opacity-60" style={{ color: 'hsl(145 55% 22%)' }}>
              Dinheiro que entrou
            </span>
          </div>
          <p className="number-display font-semibold text-[1.4rem] leading-none" style={{ color: 'hsl(145 60% 16%)' }}>
            R$ {formatShort(totalIncome)}
          </p>
          <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'hsl(145 50% 30%)' }}>
            {incomeCount > 0 ? `${incomeCount} entrada${incomeCount !== 1 ? 's' : ''}` : 'Nada entrou'}
          </p>
        </motion.div>

        {/* Despesas */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          className="relative overflow-hidden rounded-[1.5rem] p-4"
          style={{
            background: 'linear-gradient(155deg, hsl(8 85% 93%) 0%, hsl(8 75% 87%) 100%)',
            border: '1px solid hsl(8 55% 76% / 0.6)',
            boxShadow: '0 8px 24px -12px hsl(8 60% 35% / 0.3)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(8 70% 50%)' }}>
              <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] uppercase tracking-[0.12em] font-bold opacity-60" style={{ color: 'hsl(8 70% 28%)' }}>
              Dinheiro que saiu
            </span>
          </div>
          <p className="number-display font-semibold text-[1.4rem] leading-none" style={{ color: 'hsl(8 70% 20%)' }}>
            R$ {formatShort(totalExpense)}
          </p>
          <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'hsl(8 60% 35%)' }}>
            {expenseCount > 0 ? `${expenseCount} saída${expenseCount !== 1 ? 's' : ''}` : 'Nenhuma ainda'}
          </p>
        </motion.div>

      </div>
    </div>
  );
}
