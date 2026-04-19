import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";

export type EffectType = "confetti" | "tears" | "hearts" | "shake";

interface EffectData {
  id: string;
  type: EffectType;
}

interface PiggyEffectsContextType {
  trigger: (type: EffectType) => void;
}

const PiggyEffectsContext = createContext<PiggyEffectsContextType>({ trigger: () => {} });

export function usePiggyEffects() {
  return useContext(PiggyEffectsContext);
}

export function PiggyEffectsProvider({ children }: { children: ReactNode }) {
  const [effects, setEffects] = useState<EffectData[]>([]);

  const trigger = useCallback((type: EffectType) => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    setEffects((prev) => [...prev, { id, type }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, type === "shake" ? 600 : 2800);
  }, []);

  return (
    <PiggyEffectsContext.Provider value={{ trigger }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
        <AnimatePresence>
          {effects.map((e) => (
            <EffectLayer key={e.id} type={e.type} />
          ))}
        </AnimatePresence>
      </div>
    </PiggyEffectsContext.Provider>
  );
}

function EffectLayer({ type }: { type: EffectType }) {
  if (type === "confetti") return <Confetti />;
  if (type === "tears") return <Tears />;
  if (type === "hearts") return <Hearts />;
  if (type === "shake") return <ShakeAlert />;
  return null;
}

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      rotate: Math.random() * 720 - 360,
      duration: 1.8 + Math.random() * 0.8,
      color: ["#FFD96B", "#FF9D4D", "#FF5E9A", "#7DD3C0", "#A78BFA"][i % 5],
      size: 6 + Math.random() * 6,
    }))
  );
  return (
    <>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -40, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            top: 0,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </>
  );
}

function Tears() {
  const [drops] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      delay: Math.random() * 1.2,
    }))
  );
  return (
    <>
      {drops.map((d) => (
        <motion.div
          key={d.id}
          initial={{ y: "20vh", x: `${d.x}vw`, opacity: 0, scale: 0.4 }}
          animate={{ y: "70vh", opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.6] }}
          transition={{ duration: 1.6, delay: d.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: 14,
            height: 18,
            background: "linear-gradient(180deg, #7DD3FC, #38BDF8)",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            filter: "drop-shadow(0 2px 4px rgba(56,189,248,0.4))",
          }}
        />
      ))}
    </>
  );
}

function Hearts() {
  const [hearts] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      delay: Math.random() * 1,
      scale: 0.6 + Math.random() * 0.6,
    }))
  );
  return (
    <>
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: "60vh", x: `${h.x}vw`, opacity: 0, scale: 0 }}
          animate={{ y: "10vh", opacity: [0, 1, 1, 0], scale: [0, h.scale, h.scale, 0] }}
          transition={{ duration: 2.2, delay: h.delay, ease: "easeOut" }}
          style={{ position: "absolute", fontSize: 24 }}
        >
          💖
        </motion.div>
      ))}
    </>
  );
}

function ShakeAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider shadow-lg"
    >
      ⚠️ Gasto alto detectado!
    </motion.div>
  );
}
