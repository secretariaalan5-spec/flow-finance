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
    return "Oh, você está vivo. Pensei que os agiotas já tinham te pegado.";
  } else if (hoursSince > 24) {
    return "Sumiu. Provavelmente gastando o que não tem e com medo de registrar aqui, né?";
  } else if (hoursSince > 8) {
    return "Vai fingir que não gastou nada hoje? Pode ir confessando os crimes financeiros.";
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
    return `Incrível, ${state.streak} dias seguidos sem fazer besteira. Será que vai chover dinheiro?`;
  }

  // Saldo crítico
  if (opts.balance < 0) {
    return "Saldo negativo. Parabéns, já pode dar palestras sobre como NÃO cuidar do próprio dinheiro.";
  }

  // Saldo bem alto
  if (opts.balance > 2000 && opts.totalIncome > 0) {
    return "Até que enfim um saldo decente. Vamos ver quanto tempo você demora pra estourar tudo.";
  }

  // Madrugada
  if (hour >= 0 && hour < 6) {
    return "Madrugada é a hora que as piores compras impulsivas acontecem. Vai dormir antes que compre besteira na internet.";
  }

  // Sexta
  if (day === 5 && hour >= 17) {
    return "Sextou! Já estou até vendo você destruir o resto do orçamento hoje à noite.";
  }

  // Manhã
  if (hour < 12) {
    return "Bom dia. Vamos ver quanto tempo você demora pra fazer a primeira compra inútil de hoje.";
  }

  // Tarde
  if (hour < 18) {
    return "Metade do dia já foi. Ainda sobrou dinheiro na conta ou já torrou no ifood?";
  }

  // Noite
  return "Fim do dia. Conta aí os estragos financeiros que você fez hoje, vai.";
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
