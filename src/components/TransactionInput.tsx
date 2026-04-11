import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseTransaction } from '@/lib/parser';
import { useTransactions } from '@/hooks/useTransactions';
import { Mic, MicOff, Send } from 'lucide-react';
import { sendProactiveSystemMessage } from '@/lib/gemini';
import { startListening, isSTTSupported } from '@/lib/speech';
import { recordTransaction } from '@/lib/piggyState';
import { usePiggyPopup } from './PiggyPopup';

export default function TransactionInput() {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { add } = useTransactions();
  const piggyPopup = usePiggyPopup();

  const handleShortcut = (shortcutText: string) => {
    setText(shortcutText);
    setTimeout(() => {
      const btn = document.getElementById("btn-send-tx");
      if (btn) btn.click();
    }, 100);
  };

  const handleMicrophone = () => {
    if (isListening) return;

    if (!isSTTSupported()) {
      piggyPopup.show("Seu navegador não suporta voz! Use o Chrome 🐷", "sad");
      return;
    }

    startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setText(transcript);
        // Auto-enviar após captar a fala
        setTimeout(() => {
          const btn = document.getElementById("btn-send-tx");
          if (btn) btn.click();
        }, 400);
      },
      onEnd: () => setIsListening(false),
      onError: () => {
        setIsListening(false);
        piggyPopup.show("Não consegui ouvir... Tenta de novo? 🐷", "sad", false);
      },
    });
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    const t = parseTransaction(text);
    if (!t) {
      piggyPopup.show('Não entendi... Tenta assim: "gastei 25 com mercado" 🐷', "surprised");
      return;
    }
    add(t);
    recordTransaction();
    
    // Proactive response from Piggy AI via Popup
    const rawText = text;
    setText('');
    
    setTimeout(async () => {
      const reaction = await sendProactiveSystemMessage(`O usuário registrou: ${rawText}`);
      if (reaction) {
        const mood = t.tipo === 'receita' ? 'happy' : 'sad';
        piggyPopup.show(reaction, mood);
      }
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      {/* Botões de Ação Rápida */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar w-full">
        <button 
          onClick={() => handleShortcut("gastei 35 com ifood")}
          className="whitespace-nowrap px-3 py-1.5 bg-muted/60 hover:bg-primary/20 text-foreground text-xs font-medium rounded-full border border-border/50 transition-colors flex items-center gap-1"
        >
          🍕 iFood R$35
        </button>
        <button 
          onClick={() => handleShortcut("gastei 15 com uber")}
          className="whitespace-nowrap px-3 py-1.5 bg-muted/60 hover:bg-primary/20 text-foreground text-xs font-medium rounded-full border border-border/50 transition-colors flex items-center gap-1"
        >
          🚗 Uber R$15
        </button>
        <button 
          onClick={() => handleShortcut("gastei 8 com café")}
          className="whitespace-nowrap px-3 py-1.5 bg-muted/60 hover:bg-primary/20 text-foreground text-xs font-medium rounded-full border border-border/50 transition-colors flex items-center gap-1"
        >
          ☕ Café R$8
        </button>
        <button 
          onClick={() => handleShortcut("recebi 100 de pix")}
          className="whitespace-nowrap px-3 py-1.5 bg-muted/60 hover:bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-border/50 transition-colors flex items-center gap-1"
        >
          💰 Pix +R$100
        </button>
      </div>

      <div className="flex gap-2 relative">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={isListening ? '🎤 Ouvindo... Fale agora!' : 'Ex: gastei 25 com mercado'}
          className={`flex-1 bg-muted/30 text-foreground placeholder-muted-foreground rounded-full pl-4 pr-24 py-3 text-sm outline-none border transition-all shadow-sm ${isListening ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-border/50 focus:border-primary/50'}`}
        />
        <div className="absolute right-1 top-1 flex gap-1">
          <button
            onClick={handleMicrophone}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-muted-foreground hover:bg-muted/80'}`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            id="btn-send-tx"
            onClick={handleSubmit}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
