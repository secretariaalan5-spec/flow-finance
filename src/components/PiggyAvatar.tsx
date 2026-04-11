import { motion } from "framer-motion";

export type PiggyMood = "idle" | "happy" | "sad" | "surprised";

interface PiggyAvatarProps {
  mood?: PiggyMood;
  isSpeaking?: boolean;
  className?: string;
}

export default function PiggyAvatar({ mood = "idle", isSpeaking = false, className = "" }: PiggyAvatarProps) {
  // Respiração
  const bodyAnim = {
    idle: { y: [0, -4, 0], scaleX: [1, 1.02, 1], scaleY: [1, 0.98, 1], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { y: [0, -15, 0], scaleY: [1, 1.05, 1], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } },
    sad: { y: [0, 4, 0], scaleY: [1, 0.92, 1], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    surprised: { y: -8, transition: { type: "spring", stiffness: 300, damping: 10 } },
  };

  const eyeScale = mood === "surprised" ? 1.3 : mood === "sad" ? 0.8 : 1;
  const eyeBlink = {
    idle: { scaleY: [1, 1, 1, 0.1, 1, 1] },
    happy: { scaleY: [1, 0.2, 1], y: [0, -2, 0], transition: { duration: 0.8, repeat: Infinity } },
    sad: { scaleY: [1, 0.5, 1] },
    surprised: { scaleY: 1.3 },
  };
  const eyeTransition = {
    idle: { duration: 5, repeat: Infinity, times: [0, 0.45, 0.48, 0.5, 0.52, 1] }
  };

  // Caras e Bocas com mais detalhes (paths complexos)
  const mouthAnim = {
    speaking: { 
      d: [
        "M 85 125 Q 100 135 115 125", 
        "M 80 120 Q 100 150 120 120", 
        "M 90 125 Q 100 130 110 125",
        "M 85 122 Q 100 140 115 122"
      ], 
      transition: { duration: 0.5, repeat: Infinity, ease: "linear" } 
    },
    idle: { d: "M 85 125 Q 100 135 115 125" },
    sad: { d: "M 85 130 Q 100 120 115 130" },
    happy: { d: "M 80 120 Q 100 155 120 120" }, // sorrisão aberto
    surprised: { d: "M 95 125 Q 100 135 105 125" } // boquinha em o
  };

  const armsAnim = {
    idle: { rotate: [0, 8, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { rotate: [0, -35, 0], y: [-5, -15, -5], transition: { duration: 0.6, repeat: Infinity } },
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
      <svg viewBox="-20 -20 240 240" className="w-full h-full drop-shadow-2xl" overflow="visible">
        <defs>
          <radialGradient id="bodyGrad" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#FFE0F0" />
            <stop offset="60%" stopColor="#FFA1D4" />
            <stop offset="100%" stopColor="#D95C9F" />
          </radialGradient>
          <radialGradient id="snoutGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFB3D9" />
            <stop offset="100%" stopColor="#FF78BB" />
          </radialGradient>
          <linearGradient id="legGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFA1D4" />
            <stop offset="100%" stopColor="#C24083" />
          </linearGradient>
        </defs>

        {/* Pernas */}
        <motion.ellipse cx="65" cy="175" rx="16" ry="22" fill="url(#legGrad)" />
        <motion.ellipse cx="135" cy="175" rx="16" ry="22" fill="url(#legGrad)" />
        
        {/* Orelhas */}
        <motion.path 
          d="M 35 75 L 20 15 L 85 45 Z" fill="url(#bodyGrad)" 
          animate={mood === 'sad' ? { rotate: -20, y: 10 } : mood === 'happy' ? { rotate: 5, y: -2 } : { rotate: 0 }}
          originX="85px" originY="45px"
        />
        <motion.path 
          d="M 165 75 L 180 15 L 115 45 Z" fill="url(#bodyGrad)"
          animate={mood === 'sad' ? { rotate: 20, y: 10 } : mood === 'happy' ? { rotate: -5, y: -2 } : { rotate: 0 }}
          originX="115px" originY="45px"
        />

        {/* Corpo Redondo 3D */}
        <circle cx="100" cy="100" r="80" fill="url(#bodyGrad)" />
        
        {/* Sombra Interna (Volume inferior) */}
        <path d="M 20 100 A 80 80 0 0 0 180 100 A 85 80 0 0 1 20 100 Z" fill="#902662" opacity="0.15" />
        
        {/* Olhos (Pupilas e Brilho 3D) */}
        <motion.g animate={isSpeaking ? 'idle' : mood} variants={eyeBlink as any} transition={eyeTransition as any} style={{ originX: '65px', originY: '80px'}}>
          <ellipse cx="65" cy="80" rx="11" ry="16" fill="#3D1530" style={{ scale: eyeScale }} />
          <circle cx="61" cy="74" r="4" fill="white" />
          <circle cx="68" cy="84" r="1.5" fill="white" />
        </motion.g>
        
        <motion.g animate={isSpeaking ? 'idle' : mood} variants={eyeBlink as any} transition={eyeTransition as any} style={{ originX: '135px', originY: '80px'}}>
          <ellipse cx="135" cy="80" rx="11" ry="16" fill="#3D1530" style={{ scale: eyeScale }} />
          <circle cx="131" cy="74" r="4" fill="white" />
          <circle cx="138" cy="84" r="1.5" fill="white" />
        </motion.g>

        {/* Focinho 3D */}
        <motion.ellipse cx="100" cy="105" rx="30" ry="22" fill="url(#snoutGrad)" style={{ originX: '100px', originY: '105px' }}
          animate={isSpeaking ? { scale: [1, 1.05, 1], transition: { duration: 0.3, repeat: Infinity } } : { scale: 1 }}
        />
        <ellipse cx="100" cy="95" rx="20" ry="8" fill="white" opacity="0.3" filter="blur(2px)" />
        
        {/* Narinas */}
        <ellipse cx="88" cy="103" rx="5" ry="7" fill="#B12B78" transform="rotate(-10 88 103)" />
        <ellipse cx="112" cy="103" rx="5" ry="7" fill="#B12B78" transform="rotate(10 112 103)" />

        {/* Boca Variável (Paths framer-motion) */}
        <motion.path
          fill={mood === 'happy' || isSpeaking ? "#7A1C50" : "none"}
          stroke={mood === 'happy' || isSpeaking ? "none" : "#7A1C50"}
          strokeWidth="4"
          strokeLinecap="round"
          style={{ originX: '100px', originY: '125px' }}
          variants={mouthAnim as any}
          initial={mood}
          animate={isSpeaking ? "speaking" : mood}
        />

        {/* Bracinhos 3D */}
        <motion.g variants={armsAnim} animate={mood} style={{ originX: '45px', originY: '110px' }}>
          <ellipse cx="35" cy="120" rx="14" ry="24" fill="url(#legGrad)" transform="rotate(-30 35 120)" />
        </motion.g>

        <motion.g variants={armsAnim} animate={mood} style={{ originX: '155px', originY: '110px' }}>
          <ellipse cx="165" cy="120" rx="14" ry="24" fill="url(#legGrad)" transform="rotate(30 165 120)" />
        </motion.g>
        
        {/* Bochechas Glow */}
        <motion.ellipse cx="35" cy="105" rx="12" ry="8" fill="#FF479D" filter="blur(3px)" animate={{ opacity: mood==='happy' ? 0.8 : 0.4 }} />
        <motion.ellipse cx="165" cy="105" rx="12" ry="8" fill="#FF479D" filter="blur(3px)" animate={{ opacity: mood==='happy' ? 0.8 : 0.4 }} />
      </svg>
    </motion.div>
  );
}
