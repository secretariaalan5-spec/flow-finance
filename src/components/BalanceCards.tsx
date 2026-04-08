import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function BalanceCards() {
  const { balance, totalIncome, totalExpense } = useTransactions();

  const cards = [
    { label: 'Saldo Atual', value: balance, icon: Wallet, gradient: 'gradient-accent' },
    { label: 'Receitas', value: totalIncome, icon: TrendingUp, gradient: 'gradient-income' },
    { label: 'Despesas', value: totalExpense, icon: TrendingDown, gradient: 'gradient-expense' },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* Main balance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="gradient-accent rounded-2xl p-5 text-primary-foreground"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Saldo Atual</p>
            <p className="text-3xl font-heading font-bold mt-1">{formatCurrency(balance)}</p>
          </div>
          <Wallet className="w-10 h-10 opacity-50" />
        </div>
      </motion.div>

      {/* Income / Expense */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="gradient-income rounded-2xl p-4 text-primary-foreground"
        >
          <TrendingUp className="w-5 h-5 opacity-70 mb-2" />
          <p className="text-xs opacity-80">Receitas</p>
          <p className="text-lg font-heading font-bold">{formatCurrency(totalIncome)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="gradient-expense rounded-2xl p-4 text-primary-foreground"
        >
          <TrendingDown className="w-5 h-5 opacity-70 mb-2" />
          <p className="text-xs opacity-80">Despesas</p>
          <p className="text-lg font-heading font-bold">{formatCurrency(totalExpense)}</p>
        </motion.div>
      </div>
    </div>
  );
}
