import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToPiggy } from "@/lib/gemini";
import { speakPiggy, stopSpeaking, startListening, isSTTSupported } from "@/lib/speech";
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
      text: "Oinc, oinc! 🐷 Olá!! Eu sou o Cofrinho! Me conta o que gastou ou ganhou hoje! Pode falar assim: \"gastei 50 no mercado\" ou \"recebi 1200 de salário\" 🪙✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingOutLoud, setIsSpeakingOutLoud] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { add } = useTransactions();

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const speakAndAnimate = (text: string) => {
    speakPiggy(text, {
      onStart: () => setIsSpeakingOutLoud(true),
      onEnd: () => setIsSpeakingOutLoud(false),
    });
  };

  const handleMicrophone = () => {
    if (isListening) return;

    if (!isSTTSupported()) {
      addMessage("piggy", "Seu navegador não suporta voz! Use Chrome ou Edge 🐷🥺");
      return;
    }

    startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setInput(transcript);
        // Auto-enviar
        setTimeout(() => processMessage(transcript), 300);
      },
      onEnd: () => setIsListening(false),
      onError: () => {
        setIsListening(false);
        addMessage("piggy", "Não consegui ouvir... Tenta de novo? 🐷🥺");
      },
    });
  };

  const addMessage = (role: "user" | "piggy" | "system", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), role, text },
    ]);
  };

  const processMessage = async (text: string) => {
    if (!text.trim()) return;

    const userText = text.trim();
    setInput("");
    addMessage("user", userText);

    // 1️⃣ Tenta detectar uma transação no texto
    const transaction = parseTransaction(userText);

    if (transaction) {
      // SALVA A TRANSAÇÃO AUTOMATICAMENTE
      add(transaction);
      recordTransaction();

      const emoji = transaction.tipo === "receita" ? "💰" : "💸";
      const tipoLabel = transaction.tipo === "receita" ? "Receita" : "Despesa";
      const savedMsg = `✅ ${tipoLabel} registrada: R$${transaction.valor.toFixed(2)} em ${transaction.categoria} ${emoji}`;
      addMessage("system", savedMsg);

      // Pede pro Gemini reagir sabendo que a transação foi salva
      setIsTyping(true);
      const piggyPrompt = `[SISTEMA]: O usuário disse "${userText}" e o sistema detectou e SALVOU automaticamente uma ${transaction.tipo} de R$${transaction.valor.toFixed(2)} na categoria "${transaction.categoria}". Reaja como o Cofrinho a essa transação. Seja breve (1-2 frases). Confirme que foi salvo.`;
      const piggyResponse = await sendMessageToPiggy(piggyPrompt);
      setIsTyping(false);

      addMessage("piggy", piggyResponse);
      speakAndAnimate(piggyResponse);
    } else {
      // 2️⃣ Não é transação — conversa normal com o Porquinho
      setIsTyping(true);
      const piggyResponse = await sendMessageToPiggy(userText);
      setIsTyping(false);

      addMessage("piggy", piggyResponse);
      speakAndAnimate(piggyResponse);
    }
  };

  const handleSend = async () => {
    await processMessage(input);
  };

  const currentMood: PiggyMood = isListening ? "surprised" : isSpeakingOutLoud ? "happy" : isTyping ? "idle" : "idle";

  return (
    <div className="flex flex-col h-full bg-background max-h-[80vh] overflow-hidden">
      {/* Header com avatar */}
      <div className="flex items-center gap-3 py-4 px-4 border-b border-border/50 bg-card/50 rounded-t-2xl relative overflow-hidden justify-center shadow-sm">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col items-center">
          <PiggyAvatar
            isSpeaking={isTyping || isSpeakingOutLoud}
            mood={currentMood}
            className="w-28 h-28 -mt-2 transition-all"
          />
          <div className="mt-1 flex flex-col items-center bg-background/80 backdrop-blur-md px-4 py-1 rounded-full shadow-sm border border-border/30">
            <h2 className="font-heading font-bold text-base text-foreground leading-tight">Cofrinho</h2>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {isListening ? "🎤 Ouvindo..." : isTyping ? "Pensando..." : isSpeakingOutLoud ? "🔊 Falando..." : "Fale o que gastou ou ganhou! 🐷"}
            </p>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : msg.role === "system"
                    ? "bg-green-500/15 text-green-400 rounded-tl-sm border border-green-500/30 font-medium"
                    : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-muted text-muted-foreground rounded-2xl rounded-tl-sm p-3 border border-border/50 flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 bg-background pb-8">
        <p className="text-[10px] text-muted-foreground text-center mb-2">
          💡 Dica: diga <b>"gastei 50 no mercado"</b> ou <b>"recebi 1200 de salário"</b> e eu registro automaticamente!
        </p>
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "🎤 Ouvindo... Fale agora!" : "Fale com o Cofrinho..."}
            className={`flex-1 bg-muted/30 text-foreground placeholder-muted-foreground rounded-full pl-4 pr-28 py-3 text-sm outline-none border transition-all shadow-sm ${
              isListening ? "border-red-500 bg-red-500/10" : "border-border/50 focus:border-primary/50"
            }`}
          />
          <div className="absolute right-1 top-1 flex gap-1">
            <button
              onClick={handleMicrophone}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              title={isListening ? "Ouvindo..." : "Falar com o Porquinho"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              id="btn-send-piggy"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
