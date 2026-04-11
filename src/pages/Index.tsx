import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Clock, MessageSquare, BarChart3, Mic } from 'lucide-react';
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
import { startListening, isSTTSupported, speakPiggy } from '@/lib/speech';
import { parseTransaction } from '@/lib/parser';

type Tab = 'dashboard' | 'history' | 'chat';

export default function Index() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { balance, totalIncome, totalExpense, categoryTotals, currentMonth, add } = useTransactions();
  const piggyPopup = usePiggyPopup();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListeningHome, setIsListeningHome] = useState(false);

  // Calcular humor baseado nas finanças
  let piggyMood: PiggyMood = "idle";
  if (balance < 0) piggyMood = "sad";
  else if (balance > 1000 || (balance > 0 && totalExpense < 50)) piggyMood = "happy";

  // FASE 3: Proatividade — verificar inatividade ao abrir o app
  useEffect(() => {
    const inactivityMsg = getInactivityMessage();
    recordVisit();

    if (inactivityMsg) {
      setTimeout(() => {
        piggyPopup.show(inactivityMsg, "sad");
      }, 2000);
    } else if (isSummaryDay()) {
      // Resumo semanal às sextas
      const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || "Nada";
      setTimeout(async () => {
        const summary = await sendWeeklySummary({ totalIncome, totalExpense, topCategory });
        piggyPopup.show(summary, totalExpense > totalIncome ? "sad" : "happy");
      }, 3000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Botão "Como estou indo?" — Análise financeira completa
  const handleAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    piggyPopup.show("Deixa eu olhar suas contas... 🧐", "surprised", false);

    const analysis = await sendFinancialAnalysis({
      totalIncome,
      totalExpense,
      balance,
      categoryTotals,
      transactionCount: currentMonth.length,
    });

    setTimeout(() => {
      const mood: PiggyMood = balance < 0 ? "sad" : totalExpense > totalIncome * 0.7 ? "sad" : "happy";
      piggyPopup.show(analysis, mood);
      setIsAnalyzing(false);
    }, 1000);
  };

  // Botão "Falar com Porquinho" na Home — grava voz e auto-salva transação
  const handleVoiceHome = () => {
    if (isListeningHome) return;

    if (!isSTTSupported()) {
      piggyPopup.show("Seu navegador não suporta voz! Use o Chrome 🐷", "sad");
      return;
    }

    piggyPopup.show("Estou ouvindo! Fale o que gastou ou ganhou 🎤🐷", "surprised", false);

    startListening({
      onStart: () => setIsListeningHome(true),
      onResult: (transcript) => {
        const t = parseTransaction(transcript);
        if (t) {
          add(t);
          const msg = t.tipo === 'receita'
            ? `OINC! Recebi "${transcript}" — R$${t.valor.toFixed(2)} em ${t.categoria}! 🥳💰`
            : `Anotei! "${transcript}" — R$${t.valor.toFixed(2)} em ${t.categoria}. 🐷📝`;
          piggyPopup.show(msg, t.tipo === 'receita' ? "happy" : "idle");
        } else {
          piggyPopup.show(`Ouvi "${transcript}" mas não entendi... Tenta "gastei 30 no mercado" 🐷`, "surprised");
        }
      },
      onEnd: () => setIsListeningHome(false),
      onError: () => {
        setIsListeningHome(false);
        piggyPopup.show("Não consegui ouvir... Tenta de novo? 🐷", "sad", false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header Interativo da Home */}
      {tab === 'dashboard' && (
        <motion.header
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pt-6 pb-2 flex flex-col items-center justify-center relative"
        >
          {/* Luz de fundo do mascot */}
          <div className="absolute top-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl z-0"></div>
          
          <PiggyAvatar 
            mood={piggyMood} 
            className="w-36 h-36 z-10 transition-transform hover:scale-105" 
          />
          <div className="text-center mt-1 z-10">
            <h1 className="font-heading font-bold text-xl text-foreground">
              {piggyMood === 'sad' ? 'Eita... 🥺' : piggyMood === 'happy' ? 'Estamos Ricos! 🥳' : 'Olá! 🐷'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Como vão as moedinhas hoje?</p>
          </div>

          {/* Botões de ação do Porquinho */}
          <div className="flex gap-2 mt-3 z-10">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceHome}
              disabled={isListeningHome}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md ${
                isListeningHome 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-primary/90 text-primary-foreground hover:bg-primary'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              {isListeningHome ? 'Ouvindo...' : 'Falar'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-card border border-border/50 text-foreground hover:bg-muted/80 transition-all shadow-md disabled:opacity-50"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {isAnalyzing ? 'Analisando...' : 'Como estou?'}
            </motion.button>
          </div>
        </motion.header>
      )}

      {/* Content */}
      <main className="flex-1 px-5 pb-24 space-y-4">
        <AnimatePresence mode="wait">
          {tab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <TransactionInput />
              <BalanceCards />
              <CategoryChart />
              <div>
                <h3 className="font-heading font-semibold text-sm text-muted-foreground mb-3">Últimas Transações</h3>
                <TransactionList limit={5} />
              </div>
            </motion.div>
          ) : tab === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-heading font-bold text-lg mb-4">Histórico</h2>
              <TransactionList showFilters />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-[80vh] -mx-5 -mt-6"
            >
              <PiggyChat />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 px-6 py-3 flex justify-around max-w-lg mx-auto">
        {([
          { id: 'dashboard' as Tab, icon: LayoutDashboard, label: 'Início' },
          { id: 'chat' as Tab, icon: MessageSquare, label: 'Porquinho' },
          { id: 'history' as Tab, icon: Clock, label: 'Histórico' },
        ]).map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              tab === item.id ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
