// Serviço centralizado de Voz — TTS (falar) e STT (ouvir)
// Resolve o bug do Chrome onde getVoices() retorna vazio na 1ª chamada

let voicesLoaded = false;
let cachedVoice: SpeechSynthesisVoice | null = null;

// Pré-carrega vozes assim que possível
function preloadVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (voicesLoaded) { resolve(); return; }
    
    const tryLoad = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prioridade: Google pt-BR > qualquer pt-BR > qualquer pt > default
        cachedVoice = voices.find(v => v.lang.includes("pt-BR") && v.name.includes("Google"))
          || voices.find(v => v.lang.includes("pt-BR"))
          || voices.find(v => v.lang.startsWith("pt"))
          || voices[0];
        voicesLoaded = true;
        resolve();
      }
    };

    tryLoad();
    if (!voicesLoaded) {
      window.speechSynthesis.onvoiceschanged = () => {
        tryLoad();
        resolve();
      };
      // Timeout fallback — se após 2s as vozes não carregaram, segue sem
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
 * Pitch 1.6 para voz aguda/fofa. Rate 1.1 para falar um pouco mais rápido.
 */
export async function speakPiggy(text: string, callbacks?: SpeakCallbacks): Promise<void> {
  if (!("speechSynthesis" in window)) return;
  
  await preloadVoices();
  
  // Limpa emojis que a voz não sabe ler
  const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
  if (!cleanText) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "pt-BR";
  if (cachedVoice) utterance.voice = cachedVoice;
  utterance.pitch = 1.6;
  utterance.rate = 1.1;

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
