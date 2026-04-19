import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, type Variants } from "framer-motion";

export type PiggyMood =
  | "idle"
  | "happy"
  | "sad"
  | "surprised"
  | "sleepy"
  | "excited"
  | "thinking"
  | "proud";

interface PiggyAvatarProps {
  mood?: PiggyMood;
  isSpeaking?: boolean;
  className?: string;
  trackPointer?: boolean;
}

export default function PiggyAvatar({
  mood = "idle",
  isSpeaking = false,
  className = "",
  trackPointer = true,
}: PiggyAvatarProps) {
  // ----- Pupil tracking -----
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const sx = useSpring(pupilX, { stiffness: 180, damping: 20 });
  const sy = useSpring(pupilY, { stiffness: 180, damping: 20 });

  useEffect(() => {
    if (!trackPointer) return;
    let raf = 0;
    const handle = (clientX: number, clientY: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = svgRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const max = 4;
        pupilX.set((dx / dist) * Math.min(max, dist / 40));
        pupilY.set((dy / dist) * Math.min(max, dist / 40));
      });
    };
    const onMouse = (e: MouseEvent) => handle(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) handle(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(raf);
    };
  }, [trackPointer, pupilX, pupilY]);

  // ----- Natural blinking -----
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const blink = () => {
      const isDouble = Math.random() < 0.1;
      setBlinking(true);
      setTimeout(() => {
        setBlinking(false);
        if (isDouble) {
          setTimeout(() => setBlinking(true), 130);
          setTimeout(() => setBlinking(false), 260);
        }
      }, 140);
      const next = 4000 + Math.random() * 3000;
      timeout = setTimeout(blink, next);
    };
    timeout = setTimeout(blink, 2000 + Math.random() * 2000);
    return () => clearTimeout(timeout);
  }, []);

  // ----- Body animations -----
  const bodyAnim: Variants = {
    idle: {
      y: [0, -6, 0, -3, 0],
      rotate: [0, -2, 0, 2, 0],
      scaleX: [1, 1.03, 1, 1.02, 1],
      scaleY: [1, 0.97, 1, 0.98, 1],
      transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
    },
    happy: {
      y: [0, -18, 0, -14, 0],
      rotate: [0, -8, 0, 8, 0],
      scaleY: [1, 1.08, 1, 1.06, 1],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    sad: {
      y: [0, 5, 0],
      rotate: [-3, -3, -3],
      scaleY: [1, 0.92, 1],
      transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
    },
    surprised: {
      y: [-10, -6, -10],
      scale: [1.1, 1.05, 1.1],
      transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
    },
    sleepy: {
      y: [0, 3, 0],
      rotate: [-1, 1, -1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
    excited: {
      y: [0, -22, 0, -18, 0],
      rotate: [0, -10, 0, 10, 0],
      scale: [1, 1.05, 1, 1.05, 1],
      transition: { duration: 0.45, repeat: Infinity, ease: "easeInOut" },
    },
    thinking: {
      y: [0, -3, 0],
      rotate: [-3, -3, -3],
      transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
    },
    proud: {
      y: [0, -4, 0],
      scale: [1.04, 1.06, 1.04],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const eyeScale =
    mood === "surprised" ? 1.3 : mood === "sad" ? 0.8 : mood === "proud" ? 1.1 : 1;
  const eyeOpenY =
    mood === "sleepy" ? 0.35 : blinking ? 0.05 : 1;

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
    sleepy: { d: "M 92 128 Q 100 132 108 128" },
    excited: { d: "M 78 118 Q 100 158 122 118" },
    thinking: { d: "M 88 128 Q 100 124 112 128" },
    proud: { d: "M 82 122 Q 100 145 118 122" },
  };

  const armsAnim: Variants = {
    idle: { rotate: [0, 6, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { rotate: [0, -25, 0], y: [-5, -12, -5], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } },
    sad: { rotate: 18, y: 5 },
    surprised: { rotate: -30, y: -8 },
    sleepy: { rotate: [10, 14, 10], transition: { duration: 4, repeat: Infinity } },
    excited: { rotate: [0, -35, 0], y: [-8, -16, -8], transition: { duration: 0.4, repeat: Infinity } },
    thinking: { rotate: -45, y: -6 },
    proud: { rotate: -15, y: -4 },
  };

  const earAnim: Variants = {
    idle: { rotate: [0, 8, 0, -4, 0], transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } },
    happy: { rotate: [0, 18, 0, -10, 0], transition: { duration: 0.5, repeat: Infinity } },
    sad: { rotate: -8 },
    surprised: { rotate: [0, -15, 15, 0], transition: { duration: 0.4, repeat: Infinity } },
    sleepy: { rotate: [-6, -4, -6], transition: { duration: 4, repeat: Infinity } },
    excited: { rotate: [0, 22, -8, 22, 0], transition: { duration: 0.4, repeat: Infinity } },
    thinking: { rotate: 4 },
    proud: { rotate: [0, 10, 0], transition: { duration: 1.8, repeat: Infinity } },
  };

  const tailAnim: Variants = {
    idle: { rotate: [0, 25, 0, -15, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
    happy: { rotate: [0, 45, -10, 50, 0], transition: { duration: 0.4, repeat: Infinity } },
    sad: { rotate: -10 },
    surprised: { rotate: [0, 30, -20, 0], transition: { duration: 0.5, repeat: Infinity } },
    sleepy: { rotate: [0, 8, 0], transition: { duration: 4, repeat: Infinity } },
    excited: { rotate: [0, 60, -20, 60, 0], transition: { duration: 0.35, repeat: Infinity } },
    thinking: { rotate: [0, 15, 0], transition: { duration: 2, repeat: Infinity } },
    proud: { rotate: [0, 35, 0], transition: { duration: 1.4, repeat: Infinity } },
  };

  const showThinkingHand = mood === "thinking";
  const showProudGlow = mood === "proud";

  return (
    <motion.div
      className={`relative w-full aspect-square flex items-center justify-center ${className}`}
      variants={bodyAnim}
      animate={mood}
      initial="idle"
    >
      <svg ref={svgRef} viewBox="-20 -20 240 240" className="w-full h-full" overflow="visible">
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
          <radialGradient id="proudGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD96B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFD96B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {showProudGlow && (
          <motion.circle
            cx="100"
            cy="100"
            r="95"
            fill="url(#proudGlow)"
            animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <ellipse cx="65" cy="175" rx="14" ry="20" fill="url(#legGrad)" />
        <ellipse cx="135" cy="175" rx="14" ry="20" fill="url(#legGrad)" />

        <motion.g variants={tailAnim} animate={mood} style={{ originX: "180px", originY: "110px" }}>
          <path d="M 175 105 Q 195 100 198 115 Q 200 128 188 130" fill="none" stroke="#A85F85" strokeWidth="5" strokeLinecap="round" />
        </motion.g>

        <motion.g variants={earAnim} animate={mood} style={{ originX: "55px", originY: "55px" }}>
          <path d="M 35 75 L 22 18 L 85 45 Z" fill="url(#bodyGrad)" />
        </motion.g>
        <motion.g variants={earAnim} animate={mood} style={{ originX: "145px", originY: "55px" }}>
          <path d="M 165 75 L 178 18 L 115 45 Z" fill="url(#bodyGrad)" />
        </motion.g>

        <circle cx="100" cy="100" r="78" fill="url(#bodyGrad)" />
        <path d="M 22 100 A 78 78 0 0 0 178 100 A 82 78 0 0 1 22 100 Z" fill="#7A2655" opacity="0.12" />

        {/* Eyes - left */}
        <g>
          <ellipse
            cx="65"
            cy="80"
            rx="10"
            ry="14"
            fill="#2D1020"
            style={{ transform: `scale(${eyeScale}, ${eyeScale * eyeOpenY})`, transformOrigin: "65px 80px", transition: "transform 80ms ease-out" }}
          />
          <motion.circle cx="62" cy="75" r="3.5" fill="white" style={{ x: sx, y: sy }} />
        </g>
        {/* Eyes - right */}
        <g>
          <ellipse
            cx="135"
            cy="80"
            rx="10"
            ry="14"
            fill="#2D1020"
            style={{ transform: `scale(${eyeScale}, ${eyeScale * eyeOpenY})`, transformOrigin: "135px 80px", transition: "transform 80ms ease-out" }}
          />
          <motion.circle cx="132" cy="75" r="3.5" fill="white" style={{ x: sx, y: sy }} />
        </g>

        {/* Sleepy lashes */}
        {mood === "sleepy" && (
          <>
            <path d="M 55 78 Q 65 84 75 78" stroke="#2D1020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 125 78 Q 135 84 145 78" stroke="#2D1020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}

        <ellipse cx="100" cy="105" rx="28" ry="20" fill="url(#snoutGrad)" />
        <ellipse cx="100" cy="95" rx="18" ry="6" fill="white" opacity="0.25" />
        <ellipse cx="89" cy="103" rx="4.5" ry="6" fill="#9B2566" />
        <ellipse cx="111" cy="103" rx="4.5" ry="6" fill="#9B2566" />

        <motion.path
          fill={mood === "happy" || mood === "excited" || isSpeaking ? "#5C1340" : "none"}
          stroke={mood === "happy" || mood === "excited" || isSpeaking ? "none" : "#5C1340"}
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

        {/* Thinking hand on chin */}
        {showThinkingHand && (
          <motion.circle
            cx="120"
            cy="120"
            r="10"
            fill="url(#legGrad)"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          />
        )}

        <ellipse cx="38" cy="108" rx="11" ry="7" fill="#FF5E9A" opacity={mood === "happy" || mood === "excited" || mood === "proud" ? 0.7 : 0.35} />
        <ellipse cx="162" cy="108" rx="11" ry="7" fill="#FF5E9A" opacity={mood === "happy" || mood === "excited" || mood === "proud" ? 0.7 : 0.35} />
      </svg>
    </motion.div>
  );
}
