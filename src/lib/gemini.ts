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
