import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PiggyAvatar, { type PiggyMood } from "./PiggyAvatar";
import { speakPiggy } from "@/lib/speech";

interface PopupData {
  id: string;
  text: string;
  mood: PiggyMood;
}

interface PiggyPopupContextType {
  show: (text: string, mood?: PiggyMood, speak?: boolean) => void;
}

const PiggyPopupContext = createContext<PiggyPopupContextType>({ show: () => {} });

export function usePiggyPopup() {
  return useContext(PiggyPopupContext);
}

export function PiggyPopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const show = useCallback((text: string, mood: PiggyMood = "idle", speak = true) => {
    setPopup({ id: Date.now().toString(), text, mood });

    if (speak) {
      speakPiggy(text, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }

    // Auto-dismiss após 6 segundos
    setTimeout(() => {
      setPopup(null);
      setIsSpeaking(false);
    }, 6000);
  }, []);

  const dismiss = () => {
    setPopup(null);
    setIsSpeaking(false);
  };

  return (
    <PiggyPopupContext.Provider value={{ show }}>
      {children}

      {/* O Popup Global — FLUTUA por cima de tudo */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-center pt-4 px-4 pointer-events-none"
            style={{ maxWidth: "32rem", margin: "0 auto" }}
          >
            <div
              onClick={dismiss}
              className="pointer-events-auto flex items-start gap-3 bg-card/95 backdrop-blur-2xl border border-border/60 rounded-2xl p-3 pr-4 shadow-2xl shadow-black/30 w-full cursor-pointer"
            >
              {/* Mini avatar animado */}
              <div className="flex-shrink-0 w-16 h-16">
                <PiggyAvatar
                  mood={popup.mood}
                  isSpeaking={isSpeaking}
                  className="w-16 h-16"
                />
              </div>

              {/* Balão de fala */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Cofrinho diz:</p>
                <p className="text-sm text-foreground leading-snug">{popup.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PiggyPopupContext.Provider>
  );
}
