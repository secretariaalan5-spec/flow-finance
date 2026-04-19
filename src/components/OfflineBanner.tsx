import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const { isOnline, pendingCount } = useOnlineStatus();
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && pendingCount === 0) {
      // Acabou de sincronizar tudo — mostra feedback breve
      setJustReconnected(true);
      const t = setTimeout(() => setJustReconnected(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline, pendingCount]);

  const show = !isOnline || pendingCount > 0 || justReconnected;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold"
          style={{
            background: !isOnline
              ? 'hsl(15 85% 40%)'
              : pendingCount > 0
              ? 'hsl(42 85% 40%)'
              : 'hsl(145 60% 35%)',
            color: 'white',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.4)',
          }}
        >
          {!isOnline && (
            <>
              <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Modo offline — transações salvas localmente</span>
            </>
          )}
          {isOnline && pendingCount > 0 && (
            <>
              <RefreshCw className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
              <span>Sincronizando {pendingCount} transaç{pendingCount === 1 ? 'ão' : 'ões'}…</span>
            </>
          )}
          {justReconnected && isOnline && pendingCount === 0 && (
            <>
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Tudo sincronizado! ✓</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
