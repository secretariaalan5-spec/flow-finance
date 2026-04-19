import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Clock, Sparkles, Plus, Sun, Moon, LogOut, Target } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import BalanceCards from '@/components/BalanceCards';
import TransactionInput from '@/components/TransactionInput';
import CategoryChart from '@/components/CategoryChart';
import TransactionList from '@/components/TransactionList';
import PiggyChat from '@/components/PiggyChat';
import PiggyAvatar, { PiggyMood } from '@/components/PiggyAvatar';
import BudgetBars from '@/components/BudgetBars';
import BudgetsScreen from '@/components/BudgetsScreen';
import PullToRefresh from '@/components/PullToRefresh';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { usePiggyPopup } from '@/components/PiggyPopup';
import { usePiggyEffects } from '@/components/PiggyEffects';
import { haptic } from '@/lib/haptics';
import {
  getInactivityMessage,
  recordVisit,
  isSummaryDay,
  getContextualMessage,
  isNightTime,
  isMorningFirstVisit,
  getPiggyState,
} from '@/lib/piggyState';
import { sendFinancialAnalysis, sendWeeklySummary } from '@/lib/gemini';

type Tab = 'dashboard' | 'history' | 'chat' | 'budgets';

export default function Index() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { transactions, balance, totalIncome, totalExpense, categoryTotals, currentMonth } = useTransactions();
  const { exceeded } = useBudgets();
  const piggyPopup = usePiggyPopup();
  const piggyEffects = usePiggyEffects();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const prevTxCountRef = useRef(transactions.length);
  const prevBalanceRef = useRef(balance);
  const bootedRef = useRef(false);
  const prevExceededRef = useRef(exceeded.length);

  let piggyMood: PiggyMood = 'idle';
  if (isAnalyzing) piggyMood = 'thinking';
  else if (balance < 0) piggyMood = 'sad';
  else if (getPiggyState().streak >= 7) piggyMood = 'proud';
  else if (isMorningFirstVisit()) piggyMood = 'excited';
  else if (isNightTime()) piggyMood = 'sleepy';
  else if (balance > 1000 || (balance > 0 && totalExpense < 50)) piggyMood = 'happy';

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const inactivityMsg = getInactivityMessage();
    recordVisit();
    if (inactivityMsg) {
      setTimeout(() => piggyPopup.show(inactivityMsg, 'sad'), 2000);
    } else if (isSummaryDay()) {
      const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Nada';
      setTimeout(async () => {
        const summary = await sendWeeklySummary({ totalIncome, totalExpense, topCategory });
        piggyPopup.show(summary, totalExpense > totalIncome ? 'sad' : 'happy');
      }, 3000);
    } else {
      const msg = getContextualMessage({ balance, totalExpense, totalIncome });
      const mood: PiggyMood = balance < 0 ? 'sad' : balance > 2000 ? 'happy' : 'idle';
      setTimeout(() => piggyPopup.show(msg, mood), 1800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reage a novas transações
  useEffect(() => {
    if (transactions.length > prevTxCountRef.current) {
      const last = transactions[0];
      if (last) {
        if (last.tipo === 'receita' && last.valor >= 500) {
          piggyEffects.trigger('confetti');
        }
        if (last.tipo === 'despesa') {
          const sameCategory = currentMonth.filter(
            (t) => t.tipo === 'despesa' && t.categoria === last.categoria && t.id !== last.id
          );
          if (sameCategory.length >= 3) {
            const avg = sameCategory.reduce((s, t) => s + t.valor, 0) / sameCategory.length;
            if (last.valor > avg * 1.8) piggyEffects.trigger('shake');
          }
        }
      }
    }
    prevTxCountRef.current = transactions.length;
  }, [transactions, currentMonth, piggyEffects]);

  // Reage ao saldo cruzando limites importantes
  useEffect(() => {
    if (prevBalanceRef.current >= 0 && balance < 0) {
      piggyEffects.trigger('tears');
    } else if (prevBalanceRef.current < 1000 && balance >= 1000) {
      piggyEffects.trigger('hearts');
    }
    prevBalanceRef.current = balance;
  }, [balance, piggyEffects]);

  // Reage quando um limite de categoria é ultrapassado
  useEffect(() => {
    if (exceeded.length > prevExceededRef.current) {
      const newest = exceeded[exceeded.length - 1];
      piggyPopup.show(`Opa! Você passou o limite de ${newest.categoria} esse mês 😬`, 'sad');
      piggyEffects.trigger('shake');
    }
    prevExceededRef.current = exceeded.length;
  }, [exceeded, piggyPopup, piggyEffects]);

  const handleAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    piggyPopup.show('Deixa eu olhar suas contas...', 'thinking');
    const analysis = await sendFinancialAnalysis({
      totalIncome,
      totalExpense,
      balance,
      categoryTotals,
      transactionCount: currentMonth.length,
    });
    setTimeout(() => {
      const mood: PiggyMood = balance < 0 ? 'sad' : totalExpense > totalIncome * 0.7 ? 'sad' : 'happy';
      piggyPopup.show(analysis, mood);
      setIsAnalyzing(false);
    }, 1000);
  };

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div
      className="w-full max-w-lg mx-auto flex flex-col relative"
      style={{ height: '100dvh' }}
    >
      {/* HEADER MOBILE — sticky, com avatar + saudação */}
      {tab !== 'chat' && (
        <header className="safe-top px-5 pb-3 flex items-center justify-between flex-shrink-0 z-20">
          <button
            onClick={handleAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-3 tap-scale"
          >
            <div className="relative w-12 h-12 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-primary/10 blur-md" />
              <PiggyAvatar mood={piggyMood} className="w-11 h-11 relative" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground leading-none tracking-wide">
                {greeting} 👋
              </p>
              <p className="text-base font-bold text-foreground leading-tight mt-0.5">
                {user?.email?.split('@')[0] ?? 'Você'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="w-10 h-10 rounded-2xl bg-card border border-border/50 flex items-center justify-center tap-scale"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-accent" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>
            <button
              onClick={() => signOut()}
              aria-label="Sair"
              title={`Sair (${user?.email})`}
              className="w-10 h-10 rounded-2xl bg-card border border-border/50 flex items-center justify-center tap-scale"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </header>
      )}

      {/* CONTEÚDO SCROLLÁVEL */}
      <main className="flex-1 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <PullToRefresh
                onRefresh={async () => {
                  await new Promise((r) => setTimeout(r, 700));
                  const msg = getContextualMessage({ balance, totalExpense, totalIncome });
                  piggyPopup.show(msg, balance < 0 ? 'sad' : 'happy');
                }}
              >
                <div className="px-5 pb-32 space-y-5">
                  <BalanceCards />
                  <BudgetBars onManage={() => { haptic('light'); setTab('budgets'); }} />
                  <CategoryChart />
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                        Atividade Recente
                      </p>
                      <button
                        onClick={() => { haptic('light'); setTab('history'); }}
                        className="text-[11px] uppercase tracking-wider text-primary font-semibold tap-scale"
                      >
                        Ver tudo
                      </button>
                    </div>
                    <TransactionList limit={5} />
                  </div>
                </div>
              </PullToRefresh>
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 app-scroll px-5 pb-32 pt-4"
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-1 leading-none">Histórico</h2>
              <p className="text-sm text-muted-foreground mb-2">Todas as suas transações.</p>
              <p className="text-[11px] text-muted-foreground/70 mb-4">💡 Arraste pra esquerda pra excluir</p>
              <TransactionList showFilters />
            </motion.div>
          )}

          {tab === 'budgets' && (
            <motion.div
              key="budgets"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 app-scroll px-5 pb-32 pt-4"
            >
              <BudgetsScreen />
            </motion.div>
          )}

          {tab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <PiggyChat />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* QUICK ADD SHEET (bottom sheet) */}
      <AnimatePresence>
        {showQuickAdd && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickAdd(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => { if (info.offset.y > 100) setShowQuickAdd(false); }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
            >
              <div className="elevated-card rounded-b-none p-5 pb-8 safe-bottom">
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-4 text-center">
                  Registrar Movimentação
                </p>
                <TransactionInput onDone={() => setShowQuickAdd(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV NATIVO com FAB central */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto safe-bottom px-4 pt-2">
        <div className="glass-nav rounded-3xl px-2 py-2 flex items-center justify-around relative">
          <NavBtn
            icon={Home}
            label="Início"
            active={tab === 'dashboard'}
            onClick={() => { haptic('light'); setTab('dashboard'); }}
          />
          <NavBtn
            icon={Clock}
            label="Histórico"
            active={tab === 'history'}
            onClick={() => { haptic('light'); setTab('history'); }}
          />

          {/* FAB CENTRAL */}
          <button
            onClick={() => { haptic('medium'); setShowQuickAdd(true); }}
            className="-mt-7 w-14 h-14 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/40 tap-scale border-4 border-background"
            aria-label="Adicionar transação"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>

          <NavBtn
            icon={Sparkles}
            label="Cofrinho"
            active={tab === 'chat'}
            onClick={() => { haptic('light'); setTab('chat'); }}
          />
          <NavBtn
            icon={Target}
            label="Limites"
            active={tab === 'budgets'}
            badge={exceeded.length > 0 ? exceeded.length : undefined}
            onClick={() => { haptic('light'); setTab('budgets'); }}
          />
        </div>
      </nav>
    </div>
  );
}

function NavBtn({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl tap-scale transition-all"
    >
      {active && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-2xl"
          style={{ background: 'hsl(var(--primary) / 0.12)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <div className="relative">
        <Icon
          className={`w-[22px] h-[22px] relative z-10 transition-colors ${
            active ? 'text-primary' : 'text-muted-foreground'
          }`}
          strokeWidth={active ? 2.5 : 2}
        />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center z-20">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span
        className={`text-[9px] font-bold uppercase tracking-wide relative z-10 transition-colors ${
          active ? 'text-primary' : 'text-muted-foreground/70'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

