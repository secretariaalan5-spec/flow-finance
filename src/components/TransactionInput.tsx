import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseTransaction } from '@/lib/parser';
import { useTransactions } from '@/hooks/useTransactions';
import { Mic, MicOff, ArrowRight } from 'lucide-react';
import { sendProactiveSystemMessage } from '@/lib/gemini';
import { startListening, isSTTSupported } from '@/lib/speech';
import { recordTransaction } from '@/lib/piggyState';
import { usePiggyPopup } from './PiggyPopup';

const SHORTCUTS = [
  { label: 'Mercado (R$ 50)', emoji: '🛒', text: 'gastei 50 mercado' },
  { label: 'iFood (R$ 35)', emoji: '🍔', text: 'gastei 35 ifood' },
  { label: 'Uber (R$ 15)', emoji: '🚗', text: 'gastei 15 uber' },
  { label: 'Café (R$ 8)', emoji: '☕', text: 'gastei 8 café' },
  { label: 'Salário (R$ 3.000)', emoji: '💰', text: 'recebi 3000 salário' },
];

interface Props {
  onDone?: () => void;
}

export default function TransactionInput({ onDone }: Props = {}) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { add } = useTransactions();
  const piggyPopup = usePiggyPopup();

  const submit = async (raw: string) => {
    if (!raw.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      const { getAllCategories, saveCustomCategory } = await import('@/lib/categories');
      const { parseTransactionWithAI } = await import('@/lib/gemini');
      const allCats = getAllCategories('despesa').map(c => c.label);
      
      let parsed = null;
      
      // Tenta usar a IA primeiro se estiver online
      if (navigator.onLine) {
        const aiResult = await parseTransactionWithAI(raw, allCats);
        if (aiResult) {
          parsed = {
            tipo: aiResult.tipo,
            valor: aiResult.valor,
            categoria: aiResult.categoria,
            descricao: raw.trim(),
            data: new Date().toISOString()
          };
          // Salva categoria customizada se for nova
          saveCustomCategory(aiResult.categoria, aiResult.emoji);
        }
      }

      // Fallback para parser local
      if (!parsed) {
        parsed = parseTransaction(raw);
      }

      if (!parsed) {
        piggyPopup.show('Não entendi... Tenta: "gastei 25 mercado" 🤡', 'surprised');
        return;
      }

      add(parsed);
      recordTransaction();
      setText('');
      piggyPopup.show(`Anotado: R$${parsed.valor} em ${parsed.categoria}.`, parsed.tipo === 'receita' ? 'happy' : 'idle');
      onDone?.();

      setTimeout(async () => {
        const reaction = await sendProactiveSystemMessage(`O usuário registrou: ${raw}`);
        if (reaction) piggyPopup.show(reaction, parsed.tipo === 'receita' ? 'happy' : 'sad');
      }, 1200);

    } finally {
      setIsProcessing(false);
    }
  };

  const handleMic = () => {
    if (isListening || !isSTTSupported()) return;
    startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setText(transcript);
        setTimeout(() => submit(transcript), 300);
      },
      onEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Input principal */}
      <div className="relative flex items-center gap-2 bg-muted/50 rounded-full border border-border/50 pl-5 pr-1.5 py-1.5">
        <input
          type="text"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(text)}
          placeholder={isProcessing ? '🧠 O porquinho está pensando...' : isListening ? '🎤 Ouvindo você…' : 'Ex: Comprei pão por 15'}
          disabled={isProcessing}
          className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/60 py-2 text-base outline-none disabled:opacity-50"
        />
        <button
          onClick={handleMic}
          disabled={isProcessing}
          className={`p-2.5 rounded-full transition-all tap-scale ${
            isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'text-muted-foreground'
          } disabled:opacity-30`}
          aria-label="Falar texto"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={() => submit(text)}
          disabled={!text.trim() || isProcessing}
          className="p-2.5 rounded-full gradient-primary text-primary-foreground disabled:opacity-30 tap-scale"
          aria-label="Confirmar"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
            />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Atalhos como chips com emoji */}
      <div>
        <p className="text-[10px] text-muted-foreground font-semibold mb-2 px-1">
          Ou toque em um botão rápido:
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {SHORTCUTS.map((s) => (
            <button
              key={s.label}
              onClick={() => submit(s.text)}
              className="flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-semibold bg-muted/50 hover:bg-muted text-foreground border border-border/40 tap-scale"
            >
              <span className="text-sm">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
