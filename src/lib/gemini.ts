import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
let chatSession: any = null;

const SYSTEM_PROMPT = `Você é Cofrinho, um porquinho de estimação de um aplicativo financeiro. 
Você é fofinho, carinhoso, levemente dramático e apaixonado por economizar moedinhas.
Você se importa muito com o bem estar financeiro do seu dono.
Se o dono gasta dinheiro com algo supérfluo, você chora ou reclama de forma fofa que está emagrecendo.
Se o dono ganha ou guarda dinheiro, você fica eufórico saltitando (em texto).
Use emojis divertidos como 🐷, 🪙, 🥺, 🥳 nas suas falas.
Seja conciso, suas mensagens devem ser como de um chat de WhatsApp (não mande textões muito grandes).`;

function initChat() {
  if (!apiKey || apiKey === "COLE_SUA_CHAVE_AQUI") return;
  
  genAI = new GoogleGenerativeAI(apiKey);
  
  // Tenta gemini-2.0-flash, com fallback para gemini-2.0-flash-lite
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Olá! Quem é você?" }],
      },
      {
        role: "model",
        parts: [{ text: "Oinc, oinc! 🐷 Olá!! Eu sou o Cofrinho, o seu porquinho de estimação financeiro! Estou aqui para guardar suas moedinhas e ajudar você a ficar rico! 🪙✨ Como estão as finanças hoje?" }],
      },
    ],
  });
}

initChat();

/**
 * Espera X milissegundos
 */
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Envia mensagem com retry automático (até 2 tentativas com espera)
 */
async function sendWithRetry(message: string, retries = 2): Promise<string> {
  if (!chatSession) {
    return "Oinc... Eu perdi minha chave mágica (API Key)! 🥺 Adicione sua chave do Google AI Studio no arquivo .env.local";
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await chatSession.sendMessage(message);
      return result.response.text();
    } catch (error: any) {
      const statusCode = error?.status || error?.message?.match(/\[(\d+)/)?.[1];
      
      // 429 = Rate limit — esperar e tentar novamente
      if (String(statusCode) === "429" && attempt < retries) {
        const waitTime = (attempt + 1) * 15000; // 15s, 30s
        console.warn(`🐷 Rate limit! Esperando ${waitTime/1000}s antes de tentar novamente...`);
        await delay(waitTime);
        continue;
      }
      
      // 404 = Modelo não encontrado
      if (String(statusCode) === "404") {
        console.warn("🐷 Modelo não encontrado, tentando fallback...");
        try {
          const fallbackModel = genAI!.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            systemInstruction: SYSTEM_PROMPT 
          });
          const fallbackChat = fallbackModel.startChat({});
          const result = await fallbackChat.sendMessage(message);
          return result.response.text();
        } catch {
          // Continua para o fallback offline
        }
      }

      // Última tentativa falhou — fallback offline
      if (attempt === retries) {
        console.error("🐷 Erro na API:", error);
        return getOfflineResponse(message);
      }
    }
  }
  return getOfflineResponse(message);
}

/**
 * Respostas offline quando a API não está disponível
 */
function getOfflineResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes("gast") || lower.includes("comprei") || lower.includes("paguei")) {
    return "Oinc! 🐷 Eu tô offline agora, mas anotei mentalmente esse gasto! Quando a internet voltar a gente conversa melhor sobre isso... 🪙";
  }
  if (lower.includes("recebi") || lower.includes("ganhei") || lower.includes("salário")) {
    return "OINC OINC! 💰 Mesmo offline eu fico feliz com dinheiro entrando! Quando eu voltar online vamos celebrar! 🥳";
  }
  if (lower.includes("oi") || lower.includes("olá") || lower.includes("ola")) {
    return "Oinc! 🐷 Oi oi! Eu tô sem internet agora, mas ainda tô aqui te fazendo companhia! Me conta o que aconteceu hoje! 🪙";
  }
  return "Oinc... 🐷 Tô sem internet agora, mas ainda tô aqui! Quando a conexão voltar eu respondo melhor, tá? 💕";
}

// === API PÚBLICA ===

export const sendMessageToPiggy = async (message: string): Promise<string> => {
  return sendWithRetry(message);
};

export const sendProactiveSystemMessage = async (actionDesc: string): Promise<string> => {
  const prompt = `[SISTEMA]: O usuário acabou de adicionar a seguinte transação: "${actionDesc}". Reaja a isso espontaneamente como o Cofrinho, em apenas 1 frase curta. Não use aspas.`;
  try {
    return await sendWithRetry(prompt, 1);
  } catch {
    return "";
  }
};

export const sendFinancialAnalysis = async (data: {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryTotals: Record<string, number>;
  transactionCount: number;
}): Promise<string> => {
  const categories = Object.entries(data.categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => `${cat}: R$${val.toFixed(2)}`)
    .join(", ");

  const prompt = `[SISTEMA - ANÁLISE FINANCEIRA]: O usuário pediu para você analisar as finanças dele este mês. Aqui estão os dados:
- Receita total: R$${data.totalIncome.toFixed(2)}
- Despesa total: R$${data.totalExpense.toFixed(2)}  
- Saldo atual: R$${data.balance.toFixed(2)}
- Total de transações: ${data.transactionCount}
- Gastos por categoria: ${categories || "Nenhum gasto ainda"}

Dê uma análise como o Cofrinho: engraçada, sarcástica mas carinhosa. Aponte onde ele está gastando demais, elogie se estiver economizando, e dê 1-2 dicas práticas. Máximo 4 frases.`;

  try {
    return await sendWithRetry(prompt, 1);
  } catch {
    return getOfflineAnalysis(data);
  }
};

export const sendWeeklySummary = async (data: {
  totalIncome: number;
  totalExpense: number;
  topCategory: string;
}): Promise<string> => {
  const prompt = `[SISTEMA - RESUMO SEMANAL]: É sexta-feira! Faça um resumo rápido da semana financeira do usuário:
- Receita da semana: R$${data.totalIncome.toFixed(2)}
- Gasto da semana: R$${data.totalExpense.toFixed(2)}
- Categoria que mais gastou: ${data.topCategory}
Seja breve (2 frases), engraçado e dê um conselho pro fim de semana.`;

  try {
    return await sendWithRetry(prompt, 1);
  } catch {
    return getOfflineWeeklySummary(data);
  }
};

// === FALLBACKS OFFLINE ===

function getOfflineAnalysis(data: { totalIncome: number; totalExpense: number; balance: number; categoryTotals: Record<string, number> }): string {
  const ratio = data.totalExpense / (data.totalIncome || 1);
  const topCat = Object.entries(data.categoryTotals).sort(([, a], [, b]) => b - a)[0];

  if (data.totalIncome === 0 && data.totalExpense === 0) {
    return "Oinc... Tá tudo zerado aqui! 🐷 Registra alguma coisa pra eu poder te ajudar!";
  }
  if (ratio > 0.9) {
    return `SOCORRO! 😱 Você gastou ${Math.round(ratio * 100)}% da sua renda! ${topCat ? `A culpa é de ${topCat[0]}!` : ""} Precisamos de um plano URGENTE! 🐷💸`;
  }
  if (ratio > 0.7) {
    return `Hmm... Gastou ${Math.round(ratio * 100)}% do que ganhou. 🤔 Tá no limite! ${topCat ? `${topCat[0]} tá pesando R$${topCat[1].toFixed(0)}.` : ""} Cuidado! 🐷`;
  }
  if (ratio < 0.3) {
    return `OINC OINC! 🥳🎉 Gastou só ${Math.round(ratio * 100)}% da renda! Eu tô GORDO de moedinha! Continue assim! 🐷💰`;
  }
  return `Tudo tranquilo por aqui! Saldo de R$${data.balance.toFixed(2)}. ${topCat ? `Fique de olho com ${topCat[0]}.` : ""} 🐷✨`;
}

function getOfflineWeeklySummary(data: { totalIncome: number; totalExpense: number; topCategory: string }): string {
  if (data.totalExpense > data.totalIncome) {
    return `Essa semana foi tensa... Gastou mais do que ganhou! 😰 ${data.topCategory} foi o maior vilão. Bora economizar no fim de semana? 🐷`;
  }
  return `Semana fechou positiva! 🥳 O maior gasto foi em ${data.topCategory}. Bom fim de semana e tenta não gastar tudo no lazer! 🐷💰`;
}
