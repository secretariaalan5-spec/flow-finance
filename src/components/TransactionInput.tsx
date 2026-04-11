import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseTransaction } from '@/lib/parser';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from 'sonner';
import { Mic, Send, MessageSquareText } from 'lucide-react';
import { sendProactiveSystemMessage } from '@/lib/gemini';

export default function TransactionInput() {
  const [text, setText] = useState('');
  const { add } = useTransactions();

  const handleShortcut = (shortcutText: string) => {
    setText(shortcutText);
    setTimeout(() => {
      const btn = document.getElementById("btn-send-tx");
      if (btn) btn.click();
    }, 100);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    const t = parseTransaction(text);
    if (!t) {
      toast.error('Não consegui entender. Tente: "gastei 25 com mercado"');
      return;
    }
    add(t);
    toast.success(`Transação registrada em ${t.categoria}`, {
      description: `${t.tipo === 'receita' ? '+' : '-'} R$ ${t.valor.toFixed(2)}`,
    });
    
    // Proactive response from Piggy AI
    const rawText = text; // Captura para nao limpar logo após
    setText('');
    
    setTimeout(async () => {
      const reaction = await sendProactiveSystemMessage(`O usuário registrou: ${rawText}`);
      if (reaction) {
        toast("Oinc! 🐷", {
          description: reaction,
          icon: <MessageSquareText className="w-4 h-4" />,
          duration: 5000,
        });
      }
    }, 1500); // 1.5 seconds delay just to feel natural
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
          placeholder='Ex: gastei 25 com mercado'
          className="flex-1 bg-muted/30 text-foreground placeholder-muted-foreground rounded-full pl-4 pr-12 py-3 text-sm outline-none border border-border/50 focus:border-primary/50 transition-all shadow-sm"
        />
        <button
          onClick={() => toast.info('🎤 Use a aba do Porquinho para falar!')}
          className="absolute right-12 top-1 p-2 rounded-full text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          id="btn-send-tx"
          onClick={handleSubmit}
          className="absolute right-1 top-1 p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </motion.div>
  );
}
