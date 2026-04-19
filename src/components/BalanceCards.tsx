import { motion } from 'framer-motion';
import { useTransactions } from '@/hooks/useTransactions';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

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
      {/* CARD PRINCIPAL — colorido, ilustrado, com porquinho de fundo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] p-6 text-primary-foreground"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 50%, hsl(150 60% 22%) 100%)',
          boxShadow:
            '0 24px 60px -20px hsl(150 55% 15% / 0.55), inset 0 1px 0 0 hsl(0 0% 100% / 0.15)',
        }}
      >
        {/* SVG decorativo: bolhas + porquinho */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
          viewBox="0 0 400 220"
          preserveAspectRatio="xMaxYMid slice"
        >
          <defs>
            <radialGradient id="bgBubble1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(42 80% 70%)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(42 80% 70%)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bgBubble2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Bolhas grandes */}
          <circle cx="350" cy="40" r="80" fill="url(#bgBubble1)" />
          <circle cx="380" cy="180" r="70" fill="url(#bgBubble2)" />
          <circle cx="60" cy="200" r="55" fill="url(#bgBubble2)" />

          {/* Moedas flutuantes */}
          <g opacity="0.35">
            <circle cx="320" cy="35" r="9" fill="hsl(42 85% 65%)" />
            <circle cx="320" cy="35" r="6" fill="none" stroke="hsl(42 60% 35%)" strokeWidth="1" />
            <text x="320" y="39" textAnchor="middle" fontSize="8" fill="hsl(42 60% 30%)" fontWeight="700">$</text>
          </g>
          <g opacity="0.4">
            <circle cx="355" cy="75" r="7" fill="hsl(42 85% 65%)" />
            <circle cx="355" cy="75" r="4.5" fill="none" stroke="hsl(42 60% 35%)" strokeWidth="0.8" />
          </g>
          <g opacity="0.3">
            <circle cx="295" cy="65" r="5" fill="hsl(42 85% 65%)" />
          </g>

          {/* Porquinho silhueta no canto */}
          <g transform="translate(295 110)" opacity="0.22">
            <ellipse cx="40" cy="40" rx="42" ry="34" fill="hsl(0 0% 100%)" />
            <ellipse cx="14" cy="42" rx="10" ry="8" fill="hsl(0 0% 100%)" />
            <circle cx="11" cy="42" r="2" fill="hsl(150 55% 18%)" />
            <circle cx="17" cy="42" r="2" fill="hsl(150 55% 18%)" />
            <ellipse cx="55" cy="32" rx="3" ry="2.5" fill="hsl(150 55% 18%)" transform="rotate(-30 55 32)" />
            <path d="M 78 38 Q 85 35 82 42 Q 80 48 75 45 Z" fill="hsl(0 0% 100%)" />
          </g>
        </svg>

        <div className="relative">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold opacity-80">
                Saldo Atual
              </p>
              <p className="text-[10px] capitalize mt-1 opacity-60">{monthName}</p>
            </div>
            {isHealthy && (
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold bg-white/15 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/20">
                <Sparkles className="w-3 h-3" /> Saudável
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm opacity-75">R$</span>
            <span className="number-display text-[2.75rem] font-medium leading-none">{main.int}</span>
            <span className="number-display text-xl opacity-75">,{main.dec}</span>
          </div>
        </div>
      </motion.div>

      {/* RECEITAS + DESPESAS — coloridos com ícones ilustrativos */}
      <div className="grid grid-cols-2 gap-3">
        {/* Receitas — verde menta com folhinha */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl p-4"
          style={{
            background:
              'linear-gradient(155deg, hsl(145 55% 92%) 0%, hsl(145 60% 85%) 100%)',
            border: '1px solid hsl(145 40% 75% / 0.5)',
            boxShadow: '0 10px 30px -16px hsl(145 50% 25% / 0.35)',
          }}
        >
          {/* Folhas decorativas */}
          <svg aria-hidden className="absolute -right-3 -bottom-3 w-20 h-20 opacity-40" viewBox="0 0 80 80">
            <path d="M 40 70 Q 20 50 25 25 Q 50 35 50 60 Z" fill="hsl(145 55% 35%)" />
            <path d="M 40 70 Q 60 55 65 30 Q 45 40 42 65 Z" fill="hsl(145 50% 45%)" />
            <line x1="40" y1="70" x2="40" y2="50" stroke="hsl(145 45% 25%)" strokeWidth="1.5" />
          </svg>

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: 'hsl(145 55% 22%)' }}>
                Receitas
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: 'hsl(145 60% 35%)' }}
              >
                <ArrowDownRight className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-0.5" style={{ color: 'hsl(145 60% 18%)' }}>
              <span className="text-[10px] opacity-70">R$</span>
              <span className="number-display text-[1.5rem] leading-none font-medium">{inc.int}</span>
              <span className="number-display text-xs opacity-70">,{inc.dec}</span>
            </div>
          </div>
        </motion.div>

        {/* Despesas — coral suave com chama */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-3xl p-4"
          style={{
            background:
              'linear-gradient(155deg, hsl(20 90% 92%) 0%, hsl(15 85% 85%) 100%)',
            border: '1px solid hsl(15 60% 75% / 0.5)',
            boxShadow: '0 10px 30px -16px hsl(15 60% 35% / 0.35)',
          }}
        >
          {/* Carteira aberta decorativa */}
          <svg aria-hidden className="absolute -right-2 -bottom-2 w-20 h-20 opacity-40" viewBox="0 0 80 80">
            <rect x="18" y="35" width="48" height="32" rx="6" fill="hsl(15 60% 38%)" />
            <rect x="18" y="42" width="48" height="6" fill="hsl(15 70% 28%)" />
            <circle cx="55" cy="55" r="5" fill="hsl(42 85% 60%)" stroke="hsl(15 70% 25%)" strokeWidth="1" />
            <path d="M 25 28 L 40 18 L 55 28" stroke="hsl(15 70% 35%)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: 'hsl(15 70% 28%)' }}>
                Despesas
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: 'hsl(15 75% 50%)' }}
              >
                <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-0.5" style={{ color: 'hsl(15 75% 22%)' }}>
              <span className="text-[10px] opacity-70">R$</span>
              <span className="number-display text-[1.5rem] leading-none font-medium">{exp.int}</span>
              <span className="number-display text-xs opacity-70">,{exp.dec}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
