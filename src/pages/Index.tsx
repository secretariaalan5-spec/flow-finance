import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Clock, Sparkles, Plus } from 'lucide-react';
import BalanceCards from '@/components/BalanceCards';
import TransactionInput from '@/components/TransactionInput';
import CategoryChart from '@/components/CategoryChart';
import TransactionList from '@/components/TransactionList';
import PiggyChat from '@/components/PiggyChat';
import PiggyAvatar, { PiggyMood } from '@/components/PiggyAvatar';
import { useTransactions } from '@/hooks/useTransactions';
import { usePiggyPopup } from '@/components/PiggyPopup';
import { getInactivityMessage, recordVisit, isSummaryDay } from '@/lib/piggyState';
import { sendFinancialAnalysis, sendWeeklySummary } from '@/lib/gemini';

type Tab = 'dashboard' | 'history' | 'chat';

export default function Index() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { balance, totalIncome, totalExpense, categoryTotals, currentMonth } = useTransactions();
  const piggyPopup = usePiggyPopup();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  let piggyMood: PiggyMood = 'idle';
  if (balance < 0) piggyMood = 'sad';
  else if (balance > 1000 || (balance > 0 && totalExpense < 50)) piggyMood = 'happy';

  useEffect(() => {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    piggyPopup.show('Deixa eu olhar suas contas...', 'surprised');
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      {/* Header minimalista */}
      {tab !== 'chat' && (
        <header className="px-6 pt-8 pb-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              Cofrinho
            </p>
            <p className="text-xs text-muted-foreground/70 capitalize mt-0.5">{today}</p>
          </div>
          <button
            onClick={handleAnalysis}
            disabled={isAnalyzing}
            className="relative w-12 h-12 rounded-full hover:scale-105 transition-transform disabled:opacity-60"
            aria-label="Pedir análise ao Cofrinho"
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
            <PiggyAvatar mood={piggyMood} className="w-12 h-12 relative" />
          </button>
        </header>
      )}

      {/* Conteúdo */}
      <main className="flex-1 px-5 pb-28 pt-2">
        <AnimatePresence mode="wait">
          {tab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <BalanceCards />
              <TransactionInput />
              <CategoryChart />
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    Atividade Recente
                  </p>
                  <button
                    onClick={() => setTab('history')}
                    className="text-[11px] uppercase tracking-wider text-primary font-semibold hover:underline"
                  >
                    Ver tudo
                  </button>
                </div>
                <TransactionList limit={5} />
              </div>
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-display text-3xl text-foreground mb-1">Histórico</h2>
              <p className="text-sm text-muted-foreground mb-5">Todas as suas transações.</p>
              <TransactionList showFilters />
            </motion.div>
          )}

          {tab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-7rem)] -mx-5 -mt-2"
            >
              <PiggyChat />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav — minimal flutuante */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-card/90 backdrop-blur-2xl border border-border/40 rounded-full p-1.5 shadow-2xl shadow-black/40">
        {([
          { id: 'dashboard' as Tab, icon: Home, label: 'Início' },
          { id: 'history' as Tab, icon: Clock, label: 'Histórico' },
          { id: 'chat' as Tab, icon: Sparkles, label: 'Cofrinho' },
        ]).map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {active && <span className="text-xs font-semibold">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
