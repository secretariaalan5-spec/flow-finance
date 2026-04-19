// Haptic feedback nativo (Android/Chrome). iOS Safari ignora silenciosamente.
type Pattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<Pattern, number | number[]> = {
  light: 8,
  medium: 18,
  heavy: 35,
  success: [12, 40, 18],
  warning: [20, 60, 20],
  error: [30, 50, 30, 50, 30],
};

export function haptic(p: Pattern = 'light') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(patterns[p]);
    }
  } catch {
    // ignora
  }
}
