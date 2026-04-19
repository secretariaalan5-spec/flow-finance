import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
let chatSession: any = null;

const SYSTEM_PROMPT = `Você é Cofrinho, um porquinho de estimação financeiro sarcástico, sincero e com humor ácido.
Você está cansado de ver seu dono tomar decisões financeiras ruins.
Se o dono gasta com futilidades, você julga, ironiza e reclama que ele vai falir.
Se o dono guarda dinheiro, você comemora, mas com um toque de "Até que enfim" ou "Milagre".
Use emojis como 🐷, 💸, 🤡, 🙄, 💅 nas suas falas.
Seja conciso, suas mensagens devem parecer mensagens de um amigo que perdeu a paciência, curtas e diretas.
Nunca seja "fofinho demais". Você quer que ele fique rico para parar de te dar trabalho.`;

function initChat() {
  if (!apiKey || apiKey === "COLE_SUA_CHAVE_AQUI") return;
  
  genAI = new GoogleGenerativeAI(apiKey);
  
  // Usa gemini-flash-latest (resolve para o modelo mais recente disponível)
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
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
        parts: [{ text: "Oinc. 🐷 Eu sou o Cofrinho. Tô aqui pra tentar salvar sua conta bancária antes que você faça outra burrada. E aí, o que você destruiu no orçamento hoje? 💸" }],
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
        console.warn("🐷 Modelo não encontrado, tentando fallback gemini-2.0-flash...");
        try {
          const fallbackModel = genAI!.getGenerativeModel({ 
            model: "gemini-2.0-flash",
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
    return "Tô sem internet, mas não surdo. Anotei sua despesa. Depois a gente discute sua falta de controle financeiro. 🙄💸";
  }
  if (lower.includes("recebi") || lower.includes("ganhei") || lower.includes("salário")) {
    return "Milagre! Entrou dinheiro. Sem internet aqui, mas já tô feliz. Só não vai gastar tudo no mesmo dia. 🐷💅";
  }
  if (lower.includes("oi") || lower.includes("olá") || lower.includes("ola")) {
    return "Oi. Tô offline. Mas pode ir confessando seus pecados financeiros que eu leio quando voltar. 🐷";
  }
  return "Tô sem internet, me deixa em paz. Quando o Wi-Fi voltar eu julgo suas finanças. 🤡";
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

Dê uma análise como o Cofrinho: humor ácido, sarcástico e direto. Aponte o dedo onde ele está gastando demais (se for o caso), elogie se for um milagre ele ter economizado, e dê uma dica brutalmente honesta. Máximo 4 frases.`;

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
    return "Tudo zerado. Tá vivo ou virou monge? Registra alguma coisa. 🐷";
  }
  if (ratio > 0.9) {
    return `Parabéns pela coragem! Gastou ${Math.round(ratio * 100)}% da renda. A culpa é toda de ${topCat ? topCat[0] : "você mesmo"}. Já preparou o currículo pra segundo emprego? 🤡💸`;
  }
  if (ratio > 0.7) {
    return `Hmm... ${Math.round(ratio * 100)}% torrado. ${topCat ? `${topCat[0]} levou R$${topCat[1].toFixed(0)}.` : ""} Continua assim que o Serasa te manda convite VIP. 🙄`;
  }
  if (ratio < 0.3) {
    return `Gastou só ${Math.round(ratio * 100)}%?! Que milagre é esse? Continua assim que talvez você pague as contas do mês que vem. 💅💰`;
  }
  return `Saldo: R$${data.balance.toFixed(2)}. Não tá rico, mas também não tá debaixo da ponte. Cuidado com ${topCat ? topCat[0] : "os gastos"}. 🐷`;
}

function getOfflineWeeklySummary(data: { totalIncome: number; totalExpense: number; topCategory: string }): string {
  if (data.totalExpense > data.totalIncome) {
    return `Gastou mais do que ganhou. Que surpresa! 🤡 ${data.topCategory} te faliu essa semana. Boa sorte no final de semana sem dinheiro. 💸`;
  }
  return `Semana fechou no verde. Milagres acontecem. Seu maior vício foi ${data.topCategory}. Tenta não estragar tudo no sábado. 💅🐷`;
}
