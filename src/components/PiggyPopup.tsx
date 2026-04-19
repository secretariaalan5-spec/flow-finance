import { useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PiggyAvatar, { type PiggyMood } from "./PiggyAvatar";

interface PopupData {
  id: string;
  text: string;
  mood: PiggyMood;
}

interface PiggyPopupContextType {
  show: (text: string, mood?: PiggyMood, _speak?: boolean) => void;
}

const PiggyPopupContext = createContext<PiggyPopupContextType>({ show: () => {} });

export function usePiggyPopup() {
  return useContext(PiggyPopupContext);
}

export function PiggyPopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupData | null>(null);

  const show = useCallback((text: string, mood: PiggyMood = "idle") => {
    setPopup({ id: Date.now().toString(), text, mood });
    setTimeout(() => setPopup(null), 5000);
  }, []);

  const dismiss = () => setPopup(null);

  return (
    <PiggyPopupContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {popup && (
          <motion.div
            key={popup.id}
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed top-4 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none"
          >
            <div
              onClick={dismiss}
              className="pointer-events-auto flex items-start gap-3 quiet-card p-3 pr-5 max-w-md w-full cursor-pointer"
              style={{ borderRadius: "1.5rem" }}
            >
              <div className="flex-shrink-0 w-12 h-12">
                <PiggyAvatar mood={popup.mood} className="w-12 h-12" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-primary font-bold mb-1">
                  Cofrinho diz
                </p>
                <p className="text-sm text-foreground leading-snug">{popup.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PiggyPopupContext.Provider>
  );
}
