import { motion } from "framer-motion";

export type PiggyMood = "idle" | "happy" | "sad" | "surprised";

interface PiggyAvatarProps {
  mood?: PiggyMood;
  isSpeaking?: boolean;
  className?: string;
}

export default function PiggyAvatar({ mood = "idle", isSpeaking = false, className = "" }: PiggyAvatarProps) {
  // Configuração das animações focadas em cada pedaço (Framer Motion)
  
  // Respiração (corpo inteiro sobe e desce lentamente)
  const bodyAnim = {
    idle: { y: [0, -3, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
    happy: { y: [0, -10, 0], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } },
    sad: { y: [0, 2, 0], scaleY: [1, 0.95, 1], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    surprised: { y: -5, transition: { type: "spring", stiffness: 300 } },
  };

  // Olhos piscando, e mudando de forma baseado no humor
  const eyeScale = mood === "surprised" ? 1.3 : mood === "sad" ? 0.8 : 1;
  const eyeBlink = {
    idle: { scaleY: [1, 1, 0.1, 1, 1] },
    happy: { scaleY: [1, 0.2, 1], transition: { duration: 0.5, repeat: Infinity } },
    sad: { scaleY: [1, 0.5, 1] },
    surprised: { scaleY: 1.2 },
  };
  
  const eyeTransition = {
    idle: { duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }
  };

  // Boca (se mexendo enquanto fala)
  const mouthAnim = {
    speaking: { scaleY: [1, 2.5, 1.2, 2.5, 1], scaleX: [1, 0.8, 1, 0.8, 1], transition: { duration: 0.4, repeat: Infinity, ease: "linear" } },
    idle: { scaleY: 1, scaleX: 1, d: "M 80 120 Q 100 135 120 120" },
    sad: { scaleY: 1, d: "M 80 125 Q 100 115 120 125" },
    happy: { scaleY: 1, d: "M 75 115 Q 100 140 125 115" },
    surprised: { scaleY: 2, scaleX: 1.5, d: "M 90 125 Q 100 135 110 125" } // boquinha em O
  };

  // Bracinhos animando
  const armsAnim = {
    idle: { rotate: [0, 10, 0], transition: { duration: 2, repeat: Infinity } },
    happy: { rotate: [0, -30, 0], y: -5, transition: { duration: 0.4, repeat: Infinity } },
    sad: { rotate: 20, y: 5 },
    surprised: { rotate: -40, y: -10 }
  };

  return (
    <motion.div 
      className={`relative w-full aspect-square max-w-[12rem] flex items-center justify-center ${className}`}
      variants={bodyAnim}
      animate={mood}
      initial="idle"
    >
      <svg viewBox="-20 -20 240 240" className="w-full h-full drop-shadow-xl" overflow="visible">
        {/* Pernas (Atrás do Corpo) */}
        <motion.ellipse cx="70" cy="170" rx="15" ry="20" fill="#FF78BB" />
        <motion.ellipse cx="130" cy="170" rx="15" ry="20" fill="#FF78BB" />
        
        {/* Orelhas */}
        <motion.path 
          d="M 40 70 L 30 20 L 80 40 Z" 
          fill="#FF78BB" 
          animate={mood === 'sad' ? { rotate: -15, y: 5 } : { rotate: 0 }}
          originX="80px" originY="40px"
        />
        <motion.path 
          d="M 160 70 L 170 20 L 120 40 Z" 
          fill="#FF78BB"
          animate={mood === 'sad' ? { rotate: 15, y: 5 } : { rotate: 0 }}
          originX="120px" originY="40px"
        />

        {/* Corpo Redondo */}
        <circle cx="100" cy="100" r="75" fill="#FFA1D4" />
        
        {/* Sombras no corpo para dar volume 3D */}
        <circle cx="100" cy="100" r="75" fill="black" opacity="0.05" transform="translate(-5, -5)" />

        {/* Olhos (Pupilas e Brilho) */}
        <motion.g animate={isSpeaking ? 'idle' : mood} variants={eyeBlink as any} transition={eyeTransition as any} style={{ originX: '70px', originY: '80px'}}>
          <ellipse cx="70" cy="80" rx="10" ry="14" fill="#4B203E" style={{ scale: eyeScale }} />
          <circle cx="67" cy="76" r="3" fill="white" />
        </motion.g>
        
        <motion.g animate={isSpeaking ? 'idle' : mood} variants={eyeBlink as any} transition={eyeTransition as any} style={{ originX: '130px', originY: '80px'}}>
          <ellipse cx="130" cy="80" rx="10" ry="14" fill="#4B203E" style={{ scale: eyeScale }} />
          <circle cx="127" cy="76" r="3" fill="white" />
        </motion.g>

        {/* Focinho */}
        <motion.ellipse 
          cx="100" 
          cy="100" 
          rx="25" 
          ry="18" 
          fill="#FF78BB" 
          style={{ originX: '100px', originY: '100px' }}
          animate={isSpeaking ? { scale: [1, 1.05, 1], transition: { duration: 0.3, repeat: Infinity } } : { scale: 1 }}
        />
        {/* Narinas */}
        <ellipse cx="90" cy="98" rx="4" ry="5" fill="#C9378C" />
        <ellipse cx="110" cy="98" rx="4" ry="5" fill="#C9378C" />

        {/* Boca */}
        <motion.path
          fill="none"
          stroke="#C9378C"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ originX: '100px', originY: '120px' }}
          variants={mouthAnim as any}
          initial={mood}
          animate={isSpeaking ? "speaking" : mood}
        />

        {/* Bracinhos (Na frente do Corpo) */}
        <motion.g variants={armsAnim} animate={mood} style={{ originX: '45px', originY: '110px' }}>
          <ellipse cx="40" cy="120" rx="12" ry="22" fill="#FFA1D4" stroke="#FF78BB" strokeWidth="2" transform="rotate(-30 40 120)" />
        </motion.g>

        <motion.g variants={armsAnim} animate={mood} style={{ originX: '155px', originY: '110px' }}>
          <ellipse cx="160" cy="120" rx="12" ry="22" fill="#FFA1D4" stroke="#FF78BB" strokeWidth="2" transform="rotate(30 160 120)" />
        </motion.g>
        
        {/* Blush nas bochechas */}
        <ellipse cx="45" cy="100" rx="10" ry="6" fill="#FF52A2" opacity="0.4" />
        <ellipse cx="155" cy="100" rx="10" ry="6" fill="#FF52A2" opacity="0.4" />
      </svg>
    </motion.div>
  );
}
