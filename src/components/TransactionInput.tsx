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
  { label: 'Mercado', emoji: '🛒', text: 'gastei 50 mercado' },
  { label: 'iFood', emoji: '🍔', text: 'gastei 35 ifood' },
  { label: 'Uber', emoji: '🚗', text: 'gastei 15 uber' },
  { label: 'Café', emoji: '☕', text: 'gastei 8 café' },
  { label: 'Salário', emoji: '💰', text: 'recebi 3000 salário' },
];

interface Props {
  onDone?: () => void;
}

export default function TransactionInput({ onDone }: Props = {}) {
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
    onDone?.();
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Input principal */}
      <div className="relative flex items-center gap-2 bg-muted/50 rounded-full border border-border/50 pl-5 pr-1.5 py-1.5">
        <input
          type="text"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(text)}
          placeholder={isListening ? '🎤 Ouvindo…' : 'ex: 50 mercado'}
          className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/60 py-2 text-base outline-none"
        />
        <button
          onClick={handleMic}
          className={`p-2.5 rounded-full transition-all tap-scale ${
            isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'text-muted-foreground'
          }`}
          aria-label="Falar"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={() => submit(text)}
          disabled={!text.trim()}
          className="p-2.5 rounded-full gradient-primary text-primary-foreground disabled:opacity-30 tap-scale"
          aria-label="Confirmar"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Atalhos como chips com emoji */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2 px-1">
          Atalhos
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
