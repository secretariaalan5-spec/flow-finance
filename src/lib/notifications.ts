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

  const options: NotificationOptions = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200], // Vibração tipo WhatsApp
    requireInteraction: true, // Garante que a notificação fique visível até o usuário fechar
    silent: false, // Toca som padrão do celular
    tag: 'piggy-alert', // Agrupa notificações
    data: {
      url: window.location.origin
    }
  };

  try {
    // Tenta usar o Service Worker para mostrar a notificação (obrigatório no iOS e Android nativo)
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && 'showNotification' in registration) {
      await registration.showNotification(title, options);
    } else {
      // Fallback para API padrão de desktop
      new Notification(title, options);
    }
  } catch (error) {
    console.error('Falha ao enviar notificação:', error);
  }
}

// === TIPOS DE NOTIFICAÇÃO (COM LIMITADOR DE FREQUÊNCIA) ===

/**
 * Alerta de orçamento estourado. Máximo 1 por categoria a cada 5 minutos (teste).
 */
export function notifyBudgetExceeded(category: string) {
  const log = getLog();
  const now = Date.now();
  const lastAlert = log.budgetAlerts[category] || 0;
  const minutesSince = (now - lastAlert) / (1000 * 60);

  // Só notifica se passou mais de 5 minutos desde o último alerta dessa categoria
  if (minutesSince > 5) {
    triggerPush(
      "Alerta Vermelho! 🚨", 
      `Você estourou o limite de ${category}. Parabéns pela falta de controle. 🤡`
    );
    log.budgetAlerts[category] = now;
    saveLog(log);
  }
}

/**
 * Lembrete diário/inatividade.
 */
export function notifyInactivity(message: string) {
  const log = getLog();
  const now = Date.now();
  const hoursSince = (now - log.lastDailyReminder) / (1000 * 60 * 60);

  if (hoursSince > 12) {
    triggerPush("Oinc! 🐷", message);
    log.lastDailyReminder = now;
    saveLog(log);
  }
}
