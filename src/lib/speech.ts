// Serviço de Voz — TTS DESATIVADO. STT (ouvir) mantido para entrada por voz.

export type SpeakCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
};

/**
 * TTS desativado — porquinho silencioso por design.
 * Mantido como no-op para compatibilidade com componentes existentes.
 */
export async function speakPiggy(_text: string, callbacks?: SpeakCallbacks): Promise<void> {
  callbacks?.onStart?.();
  callbacks?.onEnd?.();
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return false;
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
