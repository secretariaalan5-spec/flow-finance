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
  { label: 'Mercado', text: 'gastei 50 mercado' },
  { label: 'iFood', text: 'gastei 35 ifood' },
  { label: 'Uber', text: 'gastei 15 uber' },
  { label: 'Café', text: 'gastei 8 café' },
];

export default function TransactionInput() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { add } = useTransactions();
  const piggyPopup = usePiggyPopup();

  const submit = (raw: string) => {
    if (!raw.trim()) return;
    const t = parseTransaction(raw);
    if (!t) {
      piggyPopup.show('Não entendi... Tenta: "gastei 25 mercado" 🐷', 'surprised');
      return;
    }
    add(t);
    recordTransaction();
    setText('');
    piggyPopup.show(`Transação registrada em ${t.categoria}`, t.tipo === 'receita' ? 'happy' : 'idle');
    setTimeout(async () => {
      const reaction = await sendProactiveSystemMessage(`O usuário registrou: ${raw}`);
      if (reaction) piggyPopup.show(reaction, t.tipo === 'receita' ? 'happy' : 'sad');
    }, 1200);
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="quiet-card p-5"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-3">
        Nova Transação
      </p>

      {/* Input principal estilo pílula */}
      <div className="relative flex items-center gap-2 bg-muted/40 rounded-full border border-border/40 pl-5 pr-1 py-1 mb-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(text)}
          placeholder={isListening ? '🎤 Ouvindo…' : 'ex: 50 mercado'}
          className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/60 py-2.5 text-[15px] outline-none"
        />
        <button
          onClick={handleMic}
          className={`p-2.5 rounded-full transition-all ${
            isListening
              ? 'bg-destructive text-destructive-foreground animate-pulse'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          aria-label="Falar"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={() => submit(text)}
          disabled={!text.trim()}
          className="p-2.5 rounded-full gradient-primary text-primary-foreground disabled:opacity-30 transition-opacity"
          aria-label="Confirmar"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Atalhos */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {SHORTCUTS.map((s) => (
          <button
            key={s.label}
            onClick={() => submit(s.text)}
            className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/30 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
