import { motion, type Variants } from "framer-motion";

export type PiggyMood = "idle" | "happy" | "sad" | "surprised";

interface PiggyAvatarProps {
  mood?: PiggyMood;
  isSpeaking?: boolean;
  className?: string;
}

export default function PiggyAvatar({ mood = "idle", isSpeaking = false, className = "" }: PiggyAvatarProps) {
  const bodyAnim: Variants = {
    idle: { y: [0, -4, 0], scaleX: [1, 1.02, 1], scaleY: [1, 0.98, 1], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { y: [0, -12, 0], scaleY: [1, 1.05, 1], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } },
    sad: { y: [0, 4, 0], scaleY: [1, 0.94, 1], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    surprised: { y: -6, transition: { type: "spring", stiffness: 300, damping: 10 } },
  };

  const eyeScale = mood === "surprised" ? 1.3 : mood === "sad" ? 0.8 : 1;

  const mouthAnim: Variants = {
    speaking: {
      d: [
        "M 85 125 Q 100 135 115 125",
        "M 80 120 Q 100 150 120 120",
        "M 90 125 Q 100 130 110 125",
      ],
      transition: { duration: 0.5, repeat: Infinity, ease: "linear" },
    },
    idle: { d: "M 85 125 Q 100 135 115 125" },
    sad: { d: "M 85 130 Q 100 120 115 130" },
    happy: { d: "M 80 120 Q 100 155 120 120" },
    surprised: { d: "M 95 125 Q 100 135 105 125" },
  };

  const armsAnim: Variants = {
    idle: { rotate: [0, 6, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { rotate: [0, -25, 0], y: [-5, -12, -5], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } },
    sad: { rotate: 18, y: 5 },
    surprised: { rotate: -30, y: -8 },
  };

  return (
    <motion.div
      className={`relative w-full aspect-square flex items-center justify-center ${className}`}
      variants={bodyAnim}
      animate={mood}
      initial="idle"
    >
      <svg viewBox="-20 -20 240 240" className="w-full h-full" overflow="visible">
        <defs>
          <radialGradient id="bodyGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFD4E5" />
            <stop offset="60%" stopColor="#F5A4C7" />
            <stop offset="100%" stopColor="#C97AA0" />
          </radialGradient>
          <radialGradient id="snoutGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFB3D0" />
            <stop offset="100%" stopColor="#E985B5" />
          </radialGradient>
          <linearGradient id="legGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5A4C7" />
            <stop offset="100%" stopColor="#A85F85" />
          </linearGradient>
        </defs>

        <ellipse cx="65" cy="175" rx="14" ry="20" fill="url(#legGrad)" />
        <ellipse cx="135" cy="175" rx="14" ry="20" fill="url(#legGrad)" />

        <path d="M 35 75 L 22 18 L 85 45 Z" fill="url(#bodyGrad)" />
        <path d="M 165 75 L 178 18 L 115 45 Z" fill="url(#bodyGrad)" />

        <circle cx="100" cy="100" r="78" fill="url(#bodyGrad)" />
        <path d="M 22 100 A 78 78 0 0 0 178 100 A 82 78 0 0 1 22 100 Z" fill="#7A2655" opacity="0.12" />

        <g>
          <ellipse cx="65" cy="80" rx="10" ry="14" fill="#2D1020" style={{ transform: `scale(${eyeScale})`, transformOrigin: "65px 80px" }} />
          <circle cx="62" cy="75" r="3.5" fill="white" />
        </g>
        <g>
          <ellipse cx="135" cy="80" rx="10" ry="14" fill="#2D1020" style={{ transform: `scale(${eyeScale})`, transformOrigin: "135px 80px" }} />
          <circle cx="132" cy="75" r="3.5" fill="white" />
        </g>

        <ellipse cx="100" cy="105" rx="28" ry="20" fill="url(#snoutGrad)" />
        <ellipse cx="100" cy="95" rx="18" ry="6" fill="white" opacity="0.25" />
        <ellipse cx="89" cy="103" rx="4.5" ry="6" fill="#9B2566" />
        <ellipse cx="111" cy="103" rx="4.5" ry="6" fill="#9B2566" />

        <motion.path
          fill={mood === "happy" || isSpeaking ? "#5C1340" : "none"}
          stroke={mood === "happy" || isSpeaking ? "none" : "#5C1340"}
          strokeWidth="3.5"
          strokeLinecap="round"
          variants={mouthAnim}
          initial={mood}
          animate={isSpeaking ? "speaking" : mood}
        />

        <motion.g variants={armsAnim} animate={mood} style={{ originX: "45px", originY: "110px" }}>
          <ellipse cx="35" cy="120" rx="13" ry="22" fill="url(#legGrad)" transform="rotate(-30 35 120)" />
        </motion.g>
        <motion.g variants={armsAnim} animate={mood} style={{ originX: "155px", originY: "110px" }}>
          <ellipse cx="165" cy="120" rx="13" ry="22" fill="url(#legGrad)" transform="rotate(30 165 120)" />
        </motion.g>

        <ellipse cx="38" cy="108" rx="11" ry="7" fill="#FF5E9A" opacity={mood === "happy" ? 0.7 : 0.35} />
        <ellipse cx="162" cy="108" rx="11" ry="7" fill="#FF5E9A" opacity={mood === "happy" ? 0.7 : 0.35} />
      </svg>
    </motion.div>
  );
}
