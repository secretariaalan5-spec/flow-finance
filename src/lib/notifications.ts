/**
 * Gerenciador de Notificações Locais (Web Notifications API)
 * Permite que o Porquinho envie mensagens mesmo fora do app (se o browser suportar e estiver aberto),
 * ou apenas garanta lembretes controlados sem spam.
 */

const NOTIFICATIONS_KEY = "piggy_notifications_log";

interface NotificationLog {
  lastDailyReminder: number;
  budgetAlerts: Record<string, number>; // categoria -> timestamp
}

function getLog(): NotificationLog {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : { lastDailyReminder: 0, budgetAlerts: {} };
  } catch {
    return { lastDailyReminder: 0, budgetAlerts: {} };
  }
}

function saveLog(log: NotificationLog) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(log));
}

/**
 * Solicita permissão ao usuário para enviar notificações
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Dispara uma notificação nativa, se permitido.
 * @param title Título da notificação
 * @param options Opções (ícone, corpo)
 */
async function triggerPush(title: string, body: string) {
  const hasPerm = await requestNotificationPermission();
  if (!hasPerm) return;

  try {
    // Tenta usar o Service Worker para mostrar a notificação (funciona melhor em PWA mobile)
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && 'showNotification' in registration) {
      await registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
      });
    } else {
      // Fallback para API padrão de desktop
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  } catch (error) {
    console.error('Falha ao enviar notificação:', error);
  }
}

// === TIPOS DE NOTIFICAÇÃO (COM LIMITADOR DE FREQUÊNCIA) ===

/**
 * Alerta de orçamento estourado. Máximo 1 por categoria por dia (24h).
 */
export function notifyBudgetExceeded(category: string) {
  const log = getLog();
  const now = Date.now();
  const lastAlert = log.budgetAlerts[category] || 0;
  const hoursSince = (now - lastAlert) / (1000 * 60 * 60);

  // Só notifica se passou mais de 24 horas desde o último alerta dessa categoria
  if (hoursSince > 24) {
    triggerPush(
      "Alerta Vermelho! 🚨", 
      `Você estourou o limite de ${category}. Parabéns pela falta de controle. 🤡`
    );
    log.budgetAlerts[category] = now;
    saveLog(log);
  }
}

/**
 * Lembrete diário/inatividade. Máximo 1 a cada 48h para não ser chato.
 */
export function notifyInactivity(message: string) {
  const log = getLog();
  const now = Date.now();
  const hoursSince = (now - log.lastDailyReminder) / (1000 * 60 * 60);

  if (hoursSince > 48) {
    triggerPush("Oinc! 🐷", message);
    log.lastDailyReminder = now;
    saveLog(log);
  }
}
