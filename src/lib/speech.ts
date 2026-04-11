// Serviço centralizado de Voz — TTS (falar) e STT (ouvir)
// Usa vozes femininas naturais do sistema com fallback inteligente

let voicesLoaded = false;
let cachedVoice: SpeechSynthesisVoice | null = null;

/**
 * Ranqueia vozes por qualidade para o Porquinho.
 * Prioridade: Microsoft Francisca (pt-BR natural) > Google pt-BR > qualquer pt-BR feminina > fallback
 */
function rankVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  
  if (!lang.includes("pt")) return 0;
  
  let score = 1;
  
  // Vozes naturais do Microsoft Edge/Windows (soam MUITO melhores)
  if (name.includes("francisca")) score += 100; // Francisca pt-BR é a mais natural
  if (name.includes("thalita")) score += 90;
  if (name.includes("leila")) score += 80;
  if (name.includes("microsoft") && name.includes("online")) score += 50; // Online = Neural
  if (name.includes("microsoft")) score += 30;
  
  // Vozes Google (razoáveis)
  if (name.includes("google") && lang.includes("pt-br")) score += 40;
  
  // pt-BR > pt-PT
  if (lang.includes("pt-br")) score += 10;
  
  // Vozes femininas soam mais fofinhas
  if (name.includes("female") || name.includes("feminino")) score += 5;
  
  return score;
}

function preloadVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (voicesLoaded) { resolve(); return; }
    
    const tryLoad = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Ranquear e pegar a melhor voz
        const ranked = voices
          .map(v => ({ voice: v, score: rankVoice(v) }))
          .filter(v => v.score > 0)
          .sort((a, b) => b.score - a.score);
        
        cachedVoice = ranked.length > 0 ? ranked[0].voice : voices[0];
        voicesLoaded = true;
        
        // Debug: mostrar voz escolhida
        console.log("🐷 Voz do Porquinho:", cachedVoice?.name, cachedVoice?.lang);
        resolve();
      }
    };

    tryLoad();
    if (!voicesLoaded) {
      window.speechSynthesis.onvoiceschanged = () => {
        tryLoad();
        resolve();
      };
      setTimeout(() => { voicesLoaded = true; resolve(); }, 2000);
    }
  });
}

// Inicializa ao importar
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  preloadVoices();
}

export type SpeakCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
};

/**
 * Faz o Porquinho falar um texto em voz alta.
 * Pitch alto + rate lento = voz fofa e meiga de porquinho.
 */
export async function speakPiggy(text: string, callbacks?: SpeakCallbacks): Promise<void> {
  if (!("speechSynthesis" in window)) return;
  
  await preloadVoices();
  
  // Limpa emojis e caracteres especiais que a voz não sabe ler
  const cleanText = text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
    .replace(/[✅💸💰🐷🪙🥺🥳😱😰🤔✨🎉💕💊📝]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleanText) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "pt-BR";
  if (cachedVoice) utterance.voice = cachedVoice;
  
  // Voz fofa de porquinho:
  // - Pitch 1.5: aguda e fofinha (feminina/infantil)
  // - Rate 0.88: fala devagar e com carinho, mais "meiga"
  // - Volume 1.0: alto e claro
  utterance.pitch = 1.5;
  utterance.rate = 0.88;
  utterance.volume = 1.0;

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = () => callbacks?.onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Reconhecimento de voz (STT) — abre o microfone e retorna o texto falado.
 */
export function startListening(callbacks: {
  onStart?: () => void;
  onResult: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}): void {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    callbacks.onError?.("Seu navegador não suporta reconhecimento de voz.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => callbacks.onStart?.();
  
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    callbacks.onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    callbacks.onError?.(event.error);
    callbacks.onEnd?.();
  };
  
  recognition.onend = () => callbacks.onEnd?.();

  recognition.start();
}

export function isSTTSupported(): boolean {
  return typeof window !== "undefined" && 
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}
