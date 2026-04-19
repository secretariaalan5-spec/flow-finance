import { ReactNode, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import PiggyAvatar from './PiggyAvatar';
import { haptic } from '@/lib/haptics';

interface Props {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

const THRESHOLD = 70;
const MAX_PULL = 130;

export default function PullToRefresh({ children, onRefresh, className }: Props) {
  const y = useMotionValue(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const triggered = useRef(false);

  const indicatorOpacity = useTransform(y, [0, THRESHOLD], [0, 1]);
  const indicatorScale = useTransform(y, [0, THRESHOLD], [0.6, 1]);
  const rotate = useTransform(y, [0, MAX_PULL], [0, 360]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return;
    const sc = scrollerRef.current;
    if (!sc || sc.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    dragging.current = true;
    triggered.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) {
      y.set(0);
      return;
    }
    const damped = Math.min(MAX_PULL, delta * 0.55);
    y.set(damped);
    if (damped >= THRESHOLD && !triggered.current) {
      triggered.current = true;
      haptic('medium');
    }
  };

  const finish = async () => {
    if (!dragging.current) return;
    dragging.current = false;
    const current = y.get();
    if (current >= THRESHOLD) {
      setRefreshing(true);
      animate(y, 50, { duration: 0.2 });
      try {
        await onRefresh();
      } finally {
        haptic('success');
        setRefreshing(false);
        animate(y, 0, { duration: 0.3 });
      }
    } else {
      animate(y, 0, { duration: 0.25 });
    }
    startY.current = null;
  };

  return (
    <div className={`relative h-full ${className ?? ''}`}>
      {/* Indicador */}
      <motion.div
        style={{ opacity: indicatorOpacity, scale: indicatorScale, y: useTransform(y, (v) => v - 56) }}
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      >
        <div className="w-12 h-12 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-lg">
          <motion.div style={{ rotate: refreshing ? undefined : rotate }} animate={refreshing ? { rotate: 360 } : undefined} transition={refreshing ? { repeat: Infinity, duration: 0.9, ease: 'linear' } : undefined}>
            <PiggyAvatar mood="excited" className="w-9 h-9" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        ref={scrollerRef}
        style={{ y }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={finish}
        onTouchCancel={finish}
        className="h-full app-scroll"
      >
        {children}
      </motion.div>
    </div>
  );
}
