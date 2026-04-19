import { ReactNode, useRef } from 'react';
import { motion, useMotionValue, animate, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { haptic } from '@/lib/haptics';

interface Props {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

const ACTION_WIDTH = 88;
const TRIGGER = 140;

export default function SwipeableRow({ children, onDelete, className }: Props) {
  const x = useMotionValue(0);
  const triggered = useRef(false);

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (-info.offset.x >= TRIGGER && !triggered.current) {
      triggered.current = true;
      haptic('warning');
    }
    if (-info.offset.x < TRIGGER && triggered.current) {
      triggered.current = false;
    }
  };

  const handleEnd = (_: unknown, info: PanInfo) => {
    const off = -info.offset.x;
    if (off >= TRIGGER) {
      animate(x, -400, { duration: 0.25 });
      haptic('error');
      setTimeout(onDelete, 200);
    } else if (off >= ACTION_WIDTH / 2) {
      animate(x, -ACTION_WIDTH, { type: 'spring', stiffness: 400, damping: 35 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 35 });
    }
  };

  const handleActionClick = () => {
    animate(x, -400, { duration: 0.25 });
    haptic('error');
    setTimeout(onDelete, 200);
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {/* Action background */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={handleActionClick}
          className="w-[88px] bg-destructive text-destructive-foreground flex flex-col items-center justify-center gap-1"
          aria-label="Excluir"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Excluir</span>
        </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH * 1.6, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleEnd}
        style={{ x }}
        className="relative bg-card touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
