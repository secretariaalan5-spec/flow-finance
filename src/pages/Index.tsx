import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Clock, PiggyBank, MessageSquare } from 'lucide-react';
import BalanceCards from '@/components/BalanceCards';
import TransactionInput from '@/components/TransactionInput';
import CategoryChart from '@/components/CategoryChart';
import TransactionList from '@/components/TransactionList';
import PiggyChat from '@/components/PiggyChat';
import logoImg from '@/assets/logo.png';

type Tab = 'dashboard' | 'history' | 'chat';

export default function Index() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-6 pb-3 flex items-center gap-3"
      >
        <img src={logoImg} alt="Cofrinho" className="w-10 h-10 rounded-full" />
        <div>
          <h1 className="font-heading font-bold text-lg">Cofrinho</h1>
          <p className="text-xs text-muted-foreground">Seu assistente financeiro</p>
        </div>
      </motion.header>

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
