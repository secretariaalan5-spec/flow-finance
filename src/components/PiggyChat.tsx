import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToPiggy } from "@/lib/gemini";
import { startListening, isSTTSupported } from "@/lib/speech";
import { parseTransaction } from "@/lib/parser";
import { useTransactions } from "@/hooks/useTransactions";
import { recordTransaction } from "@/lib/piggyState";
import PiggyAvatar, { PiggyMood } from "./PiggyAvatar";

type Message = {
  id: string;
  role: "user" | "piggy" | "system";
  text: string;
};

export default function PiggyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "piggy",
      text: "Olá! Sou o Cofrinho. Conta o que gastou ou ganhou hoje, ou me pergunte sobre suas finanças.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { add } = useTransactions();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (role: Message["role"], text: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), role, text }]);
  };

  const handleMic = () => {
    if (isListening || !isSTTSupported()) return;
    startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setInput(transcript);
        setTimeout(() => processMessage(transcript), 300);
      },
      onEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;
    const userText = text.trim();
    setInput("");
    addMessage("user", userText);

    const transaction = parseTransaction(userText);
    if (transaction) {
      add(transaction);
      recordTransaction();
      addMessage("system", `✓ ${transaction.tipo === "receita" ? "Receita" : "Despesa"} registrada em ${transaction.categoria}: R$ ${transaction.valor.toFixed(2)}`);
      setIsTyping(true);
      const piggyResponse = await sendMessageToPiggy(
        `[SISTEMA]: Usuário registrou ${transaction.tipo} de R$${transaction.valor.toFixed(2)} em ${transaction.categoria}. Reaja brevemente.`
      );
      setIsTyping(false);
      addMessage("piggy", piggyResponse);
    } else {
      setIsTyping(true);
      const piggyResponse = await sendMessageToPiggy(userText);
      setIsTyping(false);
      addMessage("piggy", piggyResponse);
    }
  };

  const mood: PiggyMood = isListening ? "surprised" : isTyping ? "idle" : "happy";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/30">
        <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
          <PiggyAvatar mood={mood} isSpeaking={isTyping} className="w-12 h-12" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-xl text-foreground leading-tight">Cofrinho</h2>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            {isListening ? "Ouvindo…" : isTyping ? "Pensando…" : "Online"}
          </p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : msg.role === "system"
                    ? "bg-primary/15 text-primary border border-primary/20 font-medium text-xs"
                    : "bg-muted/60 text-foreground rounded-tl-md border border-border/30"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-muted/60 rounded-3xl rounded-tl-md px-4 py-3 border border-border/30 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-2 bg-muted/40 rounded-full border border-border/40 pl-5 pr-1 py-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && processMessage(input)}
            placeholder={isListening ? "🎤 Ouvindo…" : "Pergunte algo…"}
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/60 py-2.5 text-sm outline-none"
          />
          <button
            onClick={handleMic}
            className={`p-2.5 rounded-full transition-all ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => processMessage(input)}
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-full gradient-primary text-primary-foreground disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
