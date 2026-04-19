import { useEffect, useState } from 'react';
import { getQueueCount } from '@/lib/offlineQueue';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Atualiza contador de pendentes periodicamente
  useEffect(() => {
    const refresh = async () => {
      const count = await getQueueCount();
      setPendingCount(count);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, pendingCount };
}
