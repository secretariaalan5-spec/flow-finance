// Estado persistente do Porquinho — controla inatividade, streaks, etc.

const STATE_KEY = "piggy_state";

export interface PiggyState {
  lastVisit: string;       // ISO date da última vez que abriu o app
  lastTransaction: string; // ISO date da última transação
  streak: number;          // dias seguidos usando
  totalInteractions: number;
}

function getDefaultState(): PiggyState {
  return {
    lastVisit: new Date().toISOString(),
    lastTransaction: "",
    streak: 0,
    totalInteractions: 0,
  };
}

export function getPiggyState(): PiggyState {
  try {
    const data = localStorage.getItem(STATE_KEY);
    return data ? JSON.parse(data) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

export function savePiggyState(state: PiggyState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/**
 * Registra que o usuário abriu o app agora.
 * Retorna quantas horas se passaram desde a última visita.
 */
export function recordVisit(): number {
  const state = getPiggyState();
  const now = new Date();
  const lastVisit = state.lastVisit ? new Date(state.lastVisit) : now;
  const hoursSince = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60));

  // Atualizar streak
  const daysSince = Math.floor(hoursSince / 24);
  if (daysSince === 1) {
    state.streak += 1;
  } else if (daysSince > 1) {
    state.streak = 0; // Quebrou o streak
  }

  state.lastVisit = now.toISOString();
  state.totalInteractions += 1;
  savePiggyState(state);

  return hoursSince;
}

/**
 * Registra que uma transação foi feita agora.
 */
export function recordTransaction(): void {
  const state = getPiggyState();
  state.lastTransaction = new Date().toISOString();
  savePiggyState(state);
}

/**
 * Retorna uma mensagem carente baseada no tempo de inatividade.
 * null se não precisa mostrar nada.
 */
export function getInactivityMessage(): string | null {
  const state = getPiggyState();
  if (!state.lastVisit) return null;

  const now = new Date();
  const lastVisit = new Date(state.lastVisit);
  const hoursSince = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);

  if (hoursSince > 48) {
    return "DOIS DIAS SEM ME VER?! 😭 Eu achei que você tinha me abandonado! Cadê as moedinhas?!";
  } else if (hoursSince > 24) {
    return "Sumiu por quê?! 🥺 Pensei que estouramos o orçamento de ontem... Me conta o que aconteceu!";
  } else if (hoursSince > 8) {
    return "Faz tempo que não te vejo! 🐷 Gastou alguma coisa enquanto estava fora? Me conta!";
  }
  return null;
}

/**
 * Verifica se é sexta-feira para dar o resumo semanal.
 */
export function isSummaryDay(): boolean {
  return new Date().getDay() === 5; // Sexta-feira
}

/**
 * Retorna mensagem contextual baseada na hora, dia e estado financeiro.
 */
export function getContextualMessage(opts: {
  balance: number;
  totalExpense: number;
  totalIncome: number;
}): string {
  const state = getPiggyState();
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  // Streak alto tem prioridade
  if (state.streak >= 7) {
    return `🔥 ${state.streak} dias seguidos cuidando das finanças! Tô tão orgulhoso de você!`;
  }

  // Saldo crítico
  if (opts.balance < 0) {
    return "Eita... o saldo tá no vermelho 😟 Vamos repensar os gastos juntos?";
  }

  // Saldo bem alto
  if (opts.balance > 2000 && opts.totalIncome > 0) {
    return "Tô orgulhoso de você! 💚 Continua assim que vai longe!";
  }

  // Madrugada
  if (hour >= 0 && hour < 6) {
    return "Ué, ainda acordado? 🌙 Cuidado com compras impulsivas de madrugada...";
  }

  // Sexta
  if (day === 5 && hour >= 17) {
    return "Sextou! 🎉 Só não estoura o orçamento, hein 👀";
  }

  // Manhã
  if (hour < 12) {
    return "Bom dia! ☀️ Pronto pra cuidar do dinheiro hoje?";
  }

  // Tarde
  if (hour < 18) {
    return "Como tá indo o dia? 🐷 Já gastou alguma coisa?";
  }

  // Noite
  return "Hora de revisar o dia, né? 🌙 Me conta os gastos!";
}

/**
 * Verifica se é tarde da noite (hora de ficar sleepy).
 */
export function isNightTime(): boolean {
  const h = new Date().getHours();
  return h >= 22 || h < 6;
}

/**
 * Verifica se é a primeira abertura do dia pela manhã.
 */
export function isMorningFirstVisit(): boolean {
  const state = getPiggyState();
  if (!state.lastVisit) return false;
  const last = new Date(state.lastVisit);
  const now = new Date();
  const sameDay = last.toDateString() === now.toDateString();
  const isMorning = now.getHours() >= 6 && now.getHours() < 11;
  return !sameDay && isMorning;
}
