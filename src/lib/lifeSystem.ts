// NomVerse Life & Cooldown System
// 5 Lives Base, 10 Maximum Life Cap, 2-Min Winged Life Drops, Community Life Gifting

export interface LifeState {
  userId: string;
  lives: number; // 0 to 10
  cooldownUntil: number | null; // epoch timestamp
  lastLifeLostAt?: number;
  lastTriviaClaimedDate?: string; // YYYY-MM-DD
  lifesaverKarma: number;
}

export const DEFAULT_INITIAL_LIVES = 5;
export const MAX_LIVES = 10;
export const COOLDOWN_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

const LOCAL_STORAGE_PREFIX = "nomverse_life_state_";

export function getClientLifeState(userId: string): LifeState {
  if (typeof window === "undefined" || !userId) {
    return {
      userId,
      lives: DEFAULT_INITIAL_LIVES,
      cooldownUntil: null,
      lifesaverKarma: 0,
    };
  }

  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`);
    if (raw) {
      const state: LifeState = JSON.parse(raw);
      // Check if cooldown has naturally expired
      if (state.cooldownUntil && Date.now() >= state.cooldownUntil) {
        state.lives = DEFAULT_INITIAL_LIVES;
        state.cooldownUntil = null;
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(state));
      }
      return state;
    }
  } catch {
    // ignore
  }

  const defaultState: LifeState = {
    userId,
    lives: DEFAULT_INITIAL_LIVES,
    cooldownUntil: null,
    lifesaverKarma: 0,
  };
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, JSON.stringify(defaultState));
  } catch {
    // ignore
  }
  return defaultState;
}

export function saveClientLifeState(state: LifeState): void {
  if (typeof window === "undefined" || !state.userId) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${state.userId}`, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function decrementClientLife(userId: string): LifeState {
  const current = getClientLifeState(userId);
  if (current.lives > 0) {
    current.lives -= 1;
    current.lastLifeLostAt = Date.now();

    if (current.lives === 0) {
      current.cooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
    }
    saveClientLifeState(current);
  }
  return current;
}

export function replenishClientLives(userId: string, count: number = DEFAULT_INITIAL_LIVES): LifeState {
  const current = getClientLifeState(userId);
  current.lives = Math.min(MAX_LIVES, current.lives + count);
  if (current.lives > 0) {
    current.cooldownUntil = null;
  }
  saveClientLifeState(current);
  return current;
}

export function claimTriviaEmergencyLife(userId: string): { success: boolean; state: LifeState; message?: string } {
  const current = getClientLifeState(userId);
  const today = new Date().toISOString().slice(0, 10);

  if (current.lastTriviaClaimedDate === today) {
    return {
      success: false,
      state: current,
      message: "You have already claimed your daily CC0 Emergency Life today. Ask a builder on The NomWall!",
    };
  }

  current.lives = Math.min(MAX_LIVES, current.lives + 1);
  current.cooldownUntil = null;
  current.lastTriviaClaimedDate = today;
  saveClientLifeState(current);

  return {
    success: true,
    state: current,
    message: "Correct! +1 Emergency Life granted. Nomster is back in action!",
  };
}

export function addKarmaToUser(userId: string, points: number = 10): LifeState {
  const current = getClientLifeState(userId);
  current.lifesaverKarma = (current.lifesaverKarma || 0) + points;
  saveClientLifeState(current);
  return current;
}
