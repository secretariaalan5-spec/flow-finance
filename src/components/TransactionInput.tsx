import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseTransaction } from '@/lib/parser';
import { useTransactions } from '@/hooks/useTransactions';
import { toast } from 'sonner';
import { Mic, Send } from 'lucide-react';

export default function TransactionInput() {
  const [text, setText] = useState('');
  const { add } = useTransactions();

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
    setText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder='Ex: gastei 25 com mercado'
          className="flex-1 bg-muted/50 text-foreground placeholder:text-muted-foreground rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <button
          onClick={() => toast.info('🎤 Entrada por áudio em breve!')}
          className="p-3 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mic className="w-5 h-5" />
        </button>
        <button
          onClick={handleSubmit}
          className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
