import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
let chatSession: any = null;

if (apiKey && apiKey !== "COLE_SUA_CHAVE_AQUI") {
  genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Você é Cofrinho, um porquinho de estimação de um aplicativo financeiro. 
Você é fofinho, carinhoso, levemente dramático e apaixonado por economizar moedinhas.
Você se importa muito com o bem estar financeiro do seu dono.
Se o dono gasta dinheiro com algo supérfluo, você chora ou reclama de forma fofa que está emagrecendo.
Se o dono ganha ou guarda dinheiro, você fica eufórico saltitando (em texto).
Use emojis divertidos como 🐷, 🪙, 🥺, 🥳 nas suas falas.
Seja conciso, suas mensagens devem ser como de um chat de WhatsApp (não mande textões muito grandes).`,
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

export const sendMessageToPiggy = async (message: string): Promise<string> => {
  if (!chatSession) {
    return "Oinc... Eu perdi minha chave mágica (API Key)! 🥺 Por favor, adicione a chave do Gemini no arquivo .env.local e reinicie o app para eu ganhar vida!";
  }

  try {
    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Erro ao falar com o porquinho:", error);
    return "Oinc... Tive um soluço e não entendi o que você disse (Erro na API). 🐷💊";
  }
};

export const sendProactiveSystemMessage = async (actionDesc: string): Promise<string> => {
  if (!chatSession) return "";
  
  try {
    const prompt = `[SISTEMA]: O usuário acabou de adicionar a seguinte transação: "${actionDesc}". Reaja a isso espontaneamente como o Cofrinho, em apenas 1 frase curta. Não use aspas.`;
    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    return "";
  }
};

/**
 * Análise financeira global do mês — o "Supersermão" do Porquinho.
 * Envia todos os dados financeiros para a IA gerar um relatório personalizado.
 */
export const sendFinancialAnalysis = async (data: {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryTotals: Record<string, number>;
  transactionCount: number;
}): Promise<string> => {
  if (!chatSession) {
    return "Oinc... Eu preciso da minha chave mágica (API Key) para analisar suas finanças! 🥺";
  }

  const categories = Object.entries(data.categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, val]) => `${cat}: R$${val.toFixed(2)}`)
    .join(", ");

  try {
    const prompt = `[SISTEMA - ANÁLISE FINANCEIRA]: O usuário pediu para você analisar as finanças dele este mês. Aqui estão os dados:
- Receita total: R$${data.totalIncome.toFixed(2)}
- Despesa total: R$${data.totalExpense.toFixed(2)}  
- Saldo atual: R$${data.balance.toFixed(2)}
- Total de transações: ${data.transactionCount}
- Gastos por categoria: ${categories || "Nenhum gasto ainda"}

Dê uma análise como o Cofrinho: engraçada, sarcástica mas carinhosa. Aponte onde ele está gastando demais, elogie se estiver economizando, e dê 1-2 dicas práticas. Máximo 4 frases.`;

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Erro na análise financeira:", error);
    // Fallback offline com regras locais
    return getOfflineAnalysis(data);
  }
};

/**
 * Resumo semanal automático — disparado às sextas.
 */
export const sendWeeklySummary = async (data: {
  totalIncome: number;
  totalExpense: number;
  topCategory: string;
}): Promise<string> => {
  if (!chatSession) return getOfflineWeeklySummary(data);

  try {
    const prompt = `[SISTEMA - RESUMO SEMANAL]: É sexta-feira! Faça um resumo rápido da semana financeira do usuário:
- Receita da semana: R$${data.totalIncome.toFixed(2)}
- Gasto da semana: R$${data.totalExpense.toFixed(2)}
- Categoria que mais gastou: ${data.topCategory}
Seja breve (2 frases), engraçado e dê um conselho pro fim de semana.`;

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
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
    return `SOCORRO! 😱 Você gastou ${Math.round(ratio * 100)}% da sua renda! ${topCat ? `E a culpa é toda d${topCat[0] === "A" ? "a" : "o"} ${topCat[0]}!` : ""} Precisamos de um plano URGENTE! 🐷💸`;
  }
  if (ratio > 0.7) {
    return `Hmm... Gastou ${Math.round(ratio * 100)}% do que ganhou. 🤔 Tá no limite, viu? ${topCat ? `${topCat[0]} tá pesando R$${topCat[1].toFixed(0)}.` : ""} Cuidado! 🐷`;
  }
  if (ratio < 0.3) {
    return `OINC OINC! 🥳🎉 Gastou só ${Math.round(ratio * 100)}% da renda! Eu tô GORDO de moedinha! Continue assim que vamos ficar ricos! 🐷💰`;
  }
  return `Tudo tranquilo por aqui! Saldo de R$${data.balance.toFixed(2)}. ${topCat ? `Fique de olho com ${topCat[0]}.` : ""} 🐷✨`;
}

function getOfflineWeeklySummary(data: { totalIncome: number; totalExpense: number; topCategory: string }): string {
  if (data.totalExpense > data.totalIncome) {
    return `Essa semana foi tensa... Gastou mais do que ganhou! 😰 ${data.topCategory} foi o maior vilão. Bora economizar no fim de semana? 🐷`;
  }
  return `Semana fechou positiva! 🥳 O maior gasto foi em ${data.topCategory}. Bom fim de semana e tenta não gastar tudo no lazer, tá? 🐷💰`;
}
