/**
 * NomVerse Cross-Platform Haptic Feedback Engine
 * Supports standard browser vibration API and native Telegram WebApp HapticFeedback.
 */

export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

export function triggerHaptic(style: HapticStyle = "light"): void {
  if (typeof window === "undefined") return;

  try {
    // 1. Telegram WebApp native haptics (highest fidelity on mobile)
    const tg = (window as any)?.Telegram?.WebApp?.HapticFeedback;
    if (tg) {
      if (style === "success" || style === "warning" || style === "error") {
        tg.notificationOccurred(style);
        return;
      }
      if (style === "selection") {
        tg.selectionChanged();
        return;
      }
      tg.impactOccurred(style);
      return;
    }

    // 2. Standard HTML5 Navigator Vibration API fallback
    if ("vibrate" in navigator) {
      switch (style) {
        case "light":
        case "selection":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(25);
          break;
        case "heavy":
          navigator.vibrate([40, 30, 40]);
          break;
        case "success":
          navigator.vibrate([20, 40, 30]);
          break;
        case "warning":
          navigator.vibrate([30, 50, 30]);
          break;
        case "error":
          navigator.vibrate([50, 40, 50, 40, 50]);
          break;
        default:
          navigator.vibrate(15);
      }
    }
  } catch {
    // Silent fail if vibration disabled by user agent/permissions
  }
}
