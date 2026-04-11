import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendMessageToPiggy } from "@/lib/gemini";
import { speakPiggy, stopSpeaking, startListening, isSTTSupported } from "@/lib/speech";
import PiggyAvatar, { PiggyMood } from "./PiggyAvatar";

type Message = {
  id: string;
  role: "user" | "piggy";
  text: string;
};

export default function PiggyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "piggy",
      text: "Oinc, oinc! 🐷 Olá!! Eu sou o Cofrinho, o seu porquinho de estimação! Estou aqui para guardar suas moedinhas e conversar. 🪙✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingOutLoud, setIsSpeakingOutLoud] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cleanup: parar voz ao desmontar
  useEffect(() => {
    return () => stopSpeaking();
  }, []);
  
  const handleMicrophone = () => {
    if (isListening) return;

    if (!isSTTSupported()) {
      alert("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return;
    }
    
    startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setInput(transcript);
        // Auto-enviar após captar a fala
        setTimeout(() => {
          const btn = document.getElementById("btn-send-piggy");
          if (btn) btn.click();
        }, 500);
      },
      onEnd: () => setIsListening(false),
      onError: () => setIsListening(false),
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: userText },
    ]);
    
    setIsTyping(true);
    const piggyResponse = await sendMessageToPiggy(userText);
    setIsTyping(false);

    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: "piggy", text: piggyResponse },
    ]);
    
    // Falar a resposta usando o serviço centralizado
    speakPiggy(piggyResponse, {
      onStart: () => setIsSpeakingOutLoud(true),
      onEnd: () => setIsSpeakingOutLoud(false),
    });
  };

  return (
    <div className="flex flex-col h-full bg-background max-h-[80vh] overflow-hidden">
      <div className="flex items-center gap-3 py-4 px-4 border-b border-border/50 bg-card/50 rounded-t-2xl relative overflow-hidden justify-center shadow-sm">
        
        {/* Glow effect atrás do porquinho */}
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <PiggyAvatar 
            isSpeaking={isTyping || isSpeakingOutLoud} 
            mood={isTyping ? "idle" : isSpeakingOutLoud ? "happy" : "idle"} 
            className="w-32 h-32 -mt-4 transition-all" 
          />
          <div className="mt-1 flex flex-col items-center bg-background/80 backdrop-blur-md px-4 py-1 rounded-full shadow-sm border border-border/30">
            <h2 className="font-heading font-bold text-lg text-foreground leading-tight">Cofrinho</h2>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {isListening ? "🎤 Ouvindo..." : isTyping ? "Pensando..." : isSpeakingOutLoud ? "🔊 Falando..." : "Seu Pet Financeiro 🐷"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-sm flex gap-2 items-start ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
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

      <div className="p-3 border-t border-border/50 bg-background pb-8">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "🎤 Ouvindo... Fale agora!" : "Fale com o Cofrinho..."}
            className={`flex-1 bg-muted/30 text-foreground placeholder-muted-foreground rounded-full pl-4 pr-24 py-3 text-sm outline-none border transition-all shadow-sm ${isListening ? 'border-red-500 bg-red-500/10' : 'border-border/50 focus:border-primary/50'}`}
          />
          <div className="absolute right-1 top-1 flex gap-1">
            <button
              onClick={handleMicrophone}
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
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
