import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Flame, PiggyBank, Calendar, Sparkles, BellOff } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { getPiggyState } from '@/lib/piggyState';
import { useMemo } from 'react';

type Severity = 'critical' | 'warning' | 'info' | 'success';

interface Alert {
  id: string;
  severity: Severity;
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  meta?: string;
}

function severityStyles(s: Severity) {
  switch (s) {
    case 'critical':
      return {
        ring: 'ring-destructive/40',
        bg: 'bg-destructive/10',
        icon: 'text-destructive',
        dot: 'bg-destructive',
      };
    case 'warning':
      return {
        ring: 'ring-accent/40',
        bg: 'bg-accent/10',
        icon: 'text-accent',
        dot: 'bg-accent',
      };
    case 'success':
      return {
        ring: 'ring-primary/40',
        bg: 'bg-primary/10',
        icon: 'text-primary',
        dot: 'bg-primary',
      };
    default:
      return {
        ring: 'ring-border',
        bg: 'bg-muted/40',
        icon: 'text-muted-foreground',
        dot: 'bg-muted-foreground',
      };
  }
}

export default function AlertsScreen() {
  const { currentMonth, totalIncome, totalExpense, balance, categoryTotals, transactions } = useTransactions();
  const state = getPiggyState();

  const alerts = useMemo<Alert[]>(() => {
    const out: Alert[] = [];

    // Saldo negativo
    if (balance < 0) {
      out.push({
        id: 'neg',
        severity: 'critical',
        icon: TrendingDown,
        title: 'Saldo no vermelho',
        description: `Você está R$ ${Math.abs(balance).toFixed(2)} abaixo do equilíbrio este mês. Hora de cortar gastos.`,
        meta: 'Crítico',
      });
    }

    // Despesa > 70% da receita
    if (totalIncome > 0 && totalExpense > totalIncome * 0.7) {
      const pct = Math.round((totalExpense / totalIncome) * 100);
      out.push({
        id: 'spend-ratio',
        severity: 'warning',
        icon: AlertTriangle,
        title: 'Gastando muito da renda',
        description: `Já comprometeu ${pct}% do que entrou. Cuidado pra não estourar antes do fim do mês.`,
        meta: `${pct}%`,
      });
    }

    // Categoria dominante (>40% das despesas)
    const totalCatExpense = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
    if (totalCatExpense > 0) {
      const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
      const [topCat, topVal] = sorted[0];
      const share = topVal / totalCatExpense;
      if (share > 0.4) {
        out.push({
          id: 'top-cat',
          severity: 'warning',
          icon: TrendingUp,
          title: `${topCat} dominando seus gastos`,
          description: `${Math.round(share * 100)}% das suas despesas estão nessa categoria. Vale repensar?`,
          meta: `R$ ${topVal.toFixed(0)}`,
        });
      }
    }

    // Streak ativo
    if (state.streak >= 3) {
      out.push({
        id: 'streak',
        severity: 'success',
        icon: Flame,
        title: `${state.streak} dias seguidos!`,
        description: 'Você está mantendo o controle. Continue assim — hábito é o segredo.',
        meta: '🔥',
      });
    }

    // Saldo saudável
    if (balance > 1000 && totalIncome > 0) {
      out.push({
        id: 'healthy',
        severity: 'success',
        icon: PiggyBank,
        title: 'Saldo saudável',
        description: `R$ ${balance.toFixed(2)} de folga este mês. Que tal guardar uma parte?`,
      });
    }

    // Sem transações há 3+ dias
    const last = transactions[0];
    if (last) {
      const days = Math.floor((Date.now() - new Date(last.data).getTime()) / 86400000);
      if (days >= 3) {
        out.push({
          id: 'inactive',
          severity: 'info',
          icon: Calendar,
          title: 'Sem registros há dias',
          description: `Última transação há ${days} dias. Anota tudo pra não perder o controle!`,
        });
      }
    }

    // Início de mês
    if (new Date().getDate() <= 3 && currentMonth.length === 0) {
      out.push({
        id: 'newmonth',
        severity: 'info',
        icon: Sparkles,
        title: 'Mês novo, começo limpo',
        description: 'Aproveite pra definir um teto de gastos por categoria.',
      });
    }

    return out;
  }, [balance, totalIncome, totalExpense, categoryTotals, state.streak, transactions, currentMonth]);

  return (
    <div>
      <div className="flex items-end justify-between mb-1">
        <h2 className="font-heading text-4xl text-foreground leading-none">Alertas</h2>
        <span className="number-display text-xl text-muted-foreground">{alerts.length}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-5">O que o porquinho percebeu sobre suas finanças.</p>

      {alerts.length === 0 ? (
        <div className="quiet-card p-8 text-center">
          <BellOff className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Tudo tranquilo por aqui</p>
          <p className="text-xs text-muted-foreground/80 mt-1">Sem alertas no momento. O porquinho está dormindo em paz 🐷💤</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, i) => {
            const s = severityStyles(a.severity);
            const Icon = a.icon;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`quiet-card p-4 ring-1 ${s.ring}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${s.icon}`} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <p className="text-sm font-bold text-foreground truncate">{a.title}</p>
                      {a.meta && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          {a.meta}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-snug">{a.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
