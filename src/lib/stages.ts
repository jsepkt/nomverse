// NomVerse Modular Stages & Game Modes Engine
// Community developers can define and add new stages here via Pull Requests.

export interface StageConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  gravity: number;
  candyBounce: number;
  fudSpeedMs: number;
  themeColor: string;
  hexBgTop: number;
  hexBgBottom: number;
  unlockRequirement: string;
  isUnlocked: (highScore: number) => boolean;
}

export const STAGES_CATALOG: StageConfig[] = [
  {
    id: "meadow",
    name: "Classic Candy Meadow",
    badge: "STAGE 01",
    description: "Standard Earth gravity with balanced candy drop intervals and floating FUD glitch.",
    gravity: 460,
    candyBounce: 0.65,
    fudSpeedMs: 2800,
    themeColor: "#14F195",
    hexBgTop: 0x0a101f,
    hexBgBottom: 0x04070d,
    unlockRequirement: "Unlocked by default",
    isUnlocked: () => true,
  },
  {
    id: "moon",
    name: "Moon Orbit Zero-G",
    badge: "STAGE 02",
    description: "Low lunar gravity! Candies float gently and bounce high for massive aerial combos.",
    gravity: 190,
    candyBounce: 0.85,
    fudSpeedMs: 3400,
    themeColor: "#9945FF",
    hexBgTop: 0x140b2b,
    hexBgBottom: 0x060212,
    unlockRequirement: "Reach High Score of 10+ Candies",
    isUnlocked: (highScore) => highScore >= 10,
  },
  {
    id: "matrix",
    name: "Glitch Cyberstorm",
    badge: "STAGE 03",
    description: "High velocity mode! Double-speed FUD hazards and rapid candy drops for arcade masters.",
    gravity: 580,
    candyBounce: 0.5,
    fudSpeedMs: 1900,
    themeColor: "#EF4444",
    hexBgTop: 0x1f070a,
    hexBgBottom: 0x0a0103,
    unlockRequirement: "Reach High Score of 25+ Candies",
    isUnlocked: (highScore) => highScore >= 25,
  },
];

export function getStageById(stageId: string): StageConfig {
  const found = STAGES_CATALOG.find((s) => s.id === stageId);
  return found || STAGES_CATALOG[0];
}
