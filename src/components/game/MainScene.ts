import * as Phaser from "phaser";
import { sounds } from "../audio/soundEffects";
import { nomsterVoice } from "../audio/nomsterVoice";
import { PowerUpType, POWER_UPS, rollForPowerUp } from "@/lib/powerUps";
import { SkinId } from "@/lib/skins";
import { EpisodeConfig, EPISODES } from "@/lib/episodes";

export interface DeepNomTelemetryData {
  mode: "off" | "autopilot" | "duel";
  predictedX: number;
  timeRemaining: number;
  aiScore: number;
  humanScore: number;
  status: string;
}

export interface SceneCallbacks {
  onScoreUpdate?: (score: number, streak: number) => void;
  onLivesUpdate?: (lives: number) => void;
  onGameOver?: (finalScore: number) => void;
  onHighScoreBeaten?: (score: number, streak: number) => void;
  onNomNom?: () => void;
  onPowerUpActive?: (type: PowerUpType, durationSec: number) => void;
  onPowerUpExpired?: (type: PowerUpType) => void;
  onGameStateChange?: (state: "idle" | "countdown" | "playing" | "respawning" | "gameover") => void;
  onRivalDethroned?: (score: number, challenger: string) => void;
  onFrenzyEnd?: () => void;
  onFeverMeterUpdate?: (feverPercent: number, isOverdrive: boolean) => void;
  onDashCooldownUpdate?: (dashReady: boolean) => void;
  onEpisodeComplete?: (episodeId: string, score: number, stars: number) => void;
  onBossHpUpdate?: (currentHp: number, maxHp: number) => void;
  onNextLifeDropCountdown?: (secondsRemaining: number) => void;
  onDeepNomTelemetry?: (data: DeepNomTelemetryData) => void;
}

export class MainScene extends Phaser.Scene {
  private nomster!: Phaser.GameObjects.Sprite;
  private mouthCollider!: Phaser.GameObjects.Arc;
  private candy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private fudHazard!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private groundSensor!: Phaser.GameObjects.Rectangle;
  private aimGraphics?: Phaser.GameObjects.Graphics;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private currentStageId: string = "meadow";

  // DeepNom Autonomous Ballistic Neural Autopilot & AI Duel System
  public deepNomMode: "off" | "autopilot" | "duel" = "off";
  private deepNomGraphics?: Phaser.GameObjects.Graphics;
  private deepNomReticleOuter?: Phaser.GameObjects.Arc;
  private deepNomReticleInner?: Phaser.GameObjects.Arc;
  private deepNomHudText?: Phaser.GameObjects.Text;
  private deepNomOpponent?: Phaser.GameObjects.Sprite;
  private deepNomOpponentLabel?: Phaser.GameObjects.Text;
  private deepNomOpponentMouthCollider?: Phaser.GameObjects.Arc;
  public deepNomAiScore: number = 0;
  public deepNomHumanScore: number = 0;
  private deepNomPredictedX: number = 0;
  private deepNomTimeRemaining: number = 0;

  // 3+ Kid Accessibility, Petting, & Dynamic Life Drops
  public toddlerMode: boolean = false;
  private tongueSprite?: Phaser.GameObjects.Sprite;
  private landingGuideGraphics?: Phaser.GameObjects.Graphics;
  private wingedLifeCandy?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private wingedHeartLabel?: Phaser.GameObjects.Text;
  private nextLifeDropSeconds: number = 120;
  private readonly maxCapLives: number = 10;
  private pointerDownTime: number = 0;
  private pointerDownPos: { x: number; y: number } = { x: 0, y: 0 };

  // Living Parallax Scenery & Atmosphere
  private clouds: { sprite: Phaser.GameObjects.Sprite; speed: number }[] = [];
  private fireflies: { arc: Phaser.GameObjects.Arc; baseX: number; baseY: number; phase: number; speed: number }[] = [];
  private sceneryGraphics?: Phaser.GameObjects.Graphics;
  private celestialMoon?: Phaser.GameObjects.Sprite;
  private cyberSkyline?: Phaser.GameObjects.Sprite;
  private warpLines: { line: Phaser.GameObjects.Line; speed: number; angle: number; dist: number }[] = [];

  // Bouncy Marshmallow Corner Trampolines (Second Chance Saves)
  private trampolineLeft?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  private trampolineRight?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;

  // Special Candy Variations
  private isChonkyGummy: boolean = false;
  private isSoapBubble: boolean = false;
  private bubbleSprite?: Phaser.GameObjects.Sprite;

  // Living Mascot Moods & Idle Napping
  private lastInputTime: number = 0;
  private isNapping: boolean = false;
  private nextZzzTime: number = 0;
  private sleepingEyes?: Phaser.GameObjects.Graphics;

  // Visual Polish: Cosmic Starfield, Eye Tracking & Mouth Anticipation
  private stars: { circle: Phaser.GameObjects.Arc; speed: number }[] = [];
  private leftPupil?: Phaser.GameObjects.Sprite;
  private rightPupil?: Phaser.GameObjects.Sprite;
  private mouthGlow?: Phaser.GameObjects.Arc;
  private isAnticipating: boolean = false;

  // Rival Challenge & Holder Tier Fields
  private rival?: { score: number; challenger: string };
  private rivalBeaten: boolean = false;
  private rivalBadge?: Phaser.GameObjects.Container;
  private holderTierPerks?: {
    extraLives: number;
    scoreMultiplier: number;
    raidMultiplier: number;
    hasCrown: boolean;
  };
  private frenzyTimer?: Phaser.Time.TimerEvent;

  // Power-Ups and Cosmetics
  private currentSkin: SkinId = "default";
  private accessorySprite?: Phaser.GameObjects.Sprite;
  private crownBonusSprite?: Phaser.GameObjects.Sprite;
  private shieldSprite?: Phaser.GameObjects.Sprite;
  private currentPowerUpType: PowerUpType | null = null;
  private candyLabel?: Phaser.GameObjects.Text;

  private activePowerUps = {
    magnet: false,
    shield: false,
    slowmo: false,
  };
  private magnetTimer?: Phaser.Time.TimerEvent;
  private slowmoTimer?: Phaser.Time.TimerEvent;
  private shieldTimer?: Phaser.Time.TimerEvent;

  // 60FPS Continuous Keyboard Physics
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private nomsterVelocityX: number = 0;
  private readonly maxNomsterSpeed: number = 440;
  private readonly nomsterAccel: number = 2400;
  private readonly nomsterDrag: number = 1900;

  // Sonic Super Dash & Invulnerability
  public isDashReady: boolean = true;
  private isInvulnerable: boolean = false;
  private dashCooldownTimer?: Phaser.Time.TimerEvent;
  private dashRingVisual?: Phaser.GameObjects.Arc;

  // Air Juggle Combo Multiplier
  private airJuggleCount: number = 0;

  // NOM-RAGE Fever Overdrive
  private feverMeter: number = 0;
  public isFeverOverdrive: boolean = false;
  private feverTimer?: Phaser.Time.TimerEvent;
  private feverGlowOverlay?: Phaser.GameObjects.Rectangle;

  // In-Game Lord Mega-FUD Canvas Boss & Episodic Campaign
  public currentEpisodeConfig?: EpisodeConfig;
  private bossContainer?: Phaser.GameObjects.Container;
  private bossSprite?: Phaser.GameObjects.Sprite;
  private bossHpBar?: Phaser.GameObjects.Rectangle;
  private bossHpText?: Phaser.GameObjects.Text;
  private bossCurrentHp: number = 100;
  private readonly bossMaxHp: number = 100;
  private bossLaserTimer?: Phaser.Time.TimerEvent;
  private bossMoveTween?: Phaser.Tweens.Tween;
  private isBossDefeated: boolean = false;

  // Ghost Racer Telemetry Replay
  private ghostNomster?: Phaser.GameObjects.Sprite;
  private ghostLabel?: Phaser.GameObjects.Text;
  private ghostTrajectory: { t: number; x: number }[] = [];
  private currentRunTrajectory: { t: number; x: number }[] = [];
  private runStartTime: number = 0;
  private lastTrajectorySampleTime: number = 0;

  // Game Lifecycle & Countdown State
  public isGameStarted: boolean = false;
  public playState: "idle" | "countdown" | "playing" | "respawning" | "gameover" = "idle";
  private countdownContainer?: Phaser.GameObjects.Container;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private startPromptContainer?: Phaser.GameObjects.Container;

  private score: number = 0;
  private lives: number = 3;
  private streak: number = 0;
  private isFrenzy: boolean = false;
  private isEating: boolean = false;
  private isDraggingCandy: boolean = false;
  private isMovingNomster: boolean = false;
  private callbacks: SceneCallbacks = {};
  private idleTween?: Phaser.Tweens.Tween;

  constructor() {
    super({ key: "MainScene" });
  }

  public get isReady(): boolean {
    return Boolean(this.nomster);
  }

  public setToddlerMode(enabled: boolean): void {
    this.toddlerMode = enabled;
    if (this.mouthCollider) {
      const mouthRadius = this.toddlerMode ? 80 : 48;
      this.mouthCollider.setRadius(mouthRadius);
      if (this.mouthCollider.body) {
        (this.mouthCollider.body as Phaser.Physics.Arcade.Body).setCircle(mouthRadius);
      }
    }
    if (this.candy && this.candy.active) {
      this.candy.setGravityY(this.activePowerUps.slowmo ? 120 : this.getStageGravity());
    }
  }

  public setDeepNomMode(mode: "off" | "autopilot" | "duel"): void {
    this.deepNomMode = mode;
    if (mode === "off") {
      if (this.deepNomGraphics) this.deepNomGraphics.clear();
      if (this.deepNomReticleOuter) this.deepNomReticleOuter.setVisible(false);
      if (this.deepNomReticleInner) this.deepNomReticleInner.setVisible(false);
      if (this.deepNomHudText) this.deepNomHudText.setVisible(false);
      if (this.deepNomOpponent) this.deepNomOpponent.setVisible(false);
      if (this.deepNomOpponentLabel) this.deepNomOpponentLabel.setVisible(false);
      if (this.deepNomOpponentMouthCollider && this.deepNomOpponentMouthCollider.body) {
        (this.deepNomOpponentMouthCollider.body as Phaser.Physics.Arcade.Body).enable = false;
      }
    } else if (mode === "autopilot") {
      if (this.deepNomOpponent) this.deepNomOpponent.setVisible(false);
      if (this.deepNomOpponentLabel) this.deepNomOpponentLabel.setVisible(false);
      if (this.deepNomOpponentMouthCollider && this.deepNomOpponentMouthCollider.body) {
        (this.deepNomOpponentMouthCollider.body as Phaser.Physics.Arcade.Body).enable = false;
      }
      if (this.deepNomReticleOuter) this.deepNomReticleOuter.setVisible(true);
      if (this.deepNomReticleInner) this.deepNomReticleInner.setVisible(true);
      if (this.deepNomHudText) this.deepNomHudText.setVisible(true);
    } else if (mode === "duel") {
      const { width, height } = this.cameras.main;
      const nomsterY = height - 76;
      if (!this.deepNomOpponent) {
        this.deepNomOpponent = this.add.sprite(width * 0.75, nomsterY, "nomster");
        this.deepNomOpponent.setOrigin(0.5, 0.85);
        this.deepNomOpponent.setScale(0.88);
        this.deepNomOpponent.setTint(0xff0055);
        this.deepNomOpponent.setDepth(9);

        this.deepNomOpponentLabel = this.add.text(width * 0.75, nomsterY - 95, "DEEPNOM v3.0 [AI]", {
          fontFamily: "monospace",
          fontSize: "10px",
          color: "#ff007f",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        });
        this.deepNomOpponentLabel.setOrigin(0.5);
        this.deepNomOpponentLabel.setDepth(10);

        this.deepNomOpponentMouthCollider = this.add.circle(width * 0.75, nomsterY - 34, 44, 0x000000, 0);
        this.physics.add.existing(this.deepNomOpponentMouthCollider, true);

        if (this.candy) {
          this.physics.add.overlap(this.candy, this.deepNomOpponentMouthCollider, () => {
            this.handleAiEatCandy();
          });
        }
      } else {
        this.deepNomOpponent.setVisible(true);
        if (this.deepNomOpponentLabel) this.deepNomOpponentLabel.setVisible(true);
        if (this.deepNomOpponentMouthCollider && this.deepNomOpponentMouthCollider.body) {
          (this.deepNomOpponentMouthCollider.body as Phaser.Physics.Arcade.Body).enable = true;
        }
      }
      if (this.deepNomReticleOuter) this.deepNomReticleOuter.setVisible(true);
      if (this.deepNomReticleInner) this.deepNomReticleInner.setVisible(true);
      if (this.deepNomHudText) this.deepNomHudText.setVisible(true);
    }
  }

  private initDeepNomObjects(): void {
    const { width, height } = this.cameras.main;
    const mouthY = height - 110;

    this.deepNomReticleOuter = this.add.circle(width / 2, mouthY, 22, 0x00f0ff, 0.12);
    this.deepNomReticleOuter.setStrokeStyle(2, 0x00f0ff, 0.85);
    this.deepNomReticleOuter.setDepth(19);
    this.deepNomReticleOuter.setVisible(false);

    this.deepNomReticleInner = this.add.circle(width / 2, mouthY, 5, 0x00f0ff, 0.95);
    this.deepNomReticleInner.setDepth(20);
    this.deepNomReticleInner.setVisible(false);

    this.deepNomHudText = this.add.text(width / 2, mouthY - 30, "", {
      fontFamily: "monospace",
      fontSize: "9px",
      color: "#00f0ff",
      fontStyle: "bold",
      stroke: "#050914",
      strokeThickness: 3,
    });
    this.deepNomHudText.setOrigin(0.5);
    this.deepNomHudText.setDepth(21);
    this.deepNomHudText.setVisible(false);
  }

  private handleAiEatCandy(): void {
    if (
      !this.candy ||
      !this.candy.active ||
      this.isEating ||
      this.lives <= 0 ||
      this.deepNomMode !== "duel"
    ) {
      return;
    }

    this.isEating = true;
    this.deepNomAiScore++;

    nomsterVoice.speakNomNom();
    sounds.playNom();

    if (this.deepNomOpponent) {
      this.tweens.add({
        targets: this.deepNomOpponent,
        scaleX: 1.1,
        scaleY: 0.72,
        duration: 80,
        yoyo: true,
        repeat: 1,
      });
    }

    const bannerX = this.deepNomOpponent ? this.deepNomOpponent.x : this.candy.x;
    const bannerY = this.deepNomOpponent ? this.deepNomOpponent.y - 65 : this.candy.y - 35;
    const aiEatBanner = this.add.text(
      bannerX,
      bannerY,
      `🤖 AI SNATCHED IT! [AI: ${this.deepNomAiScore} | YOU: ${this.score}]`,
      {
        fontFamily: "monospace",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#ff007f",
        stroke: "#000000",
        strokeThickness: 3,
      }
    );
    aiEatBanner.setOrigin(0.5);
    aiEatBanner.setDepth(34);
    this.tweens.add({
      targets: aiEatBanner,
      y: aiEatBanner.y - 40,
      scale: 1.15,
      alpha: 0,
      duration: 850,
      ease: "Back.easeOut",
      onComplete: () => aiEatBanner.destroy(),
    });

    const destX = this.deepNomOpponent ? this.deepNomOpponent.x : this.candy.x;
    const destY = this.deepNomOpponent ? this.deepNomOpponent.y - 34 : this.candy.y;
    this.tweens.add({
      targets: this.candy,
      x: destX,
      y: destY,
      scale: 0.1,
      alpha: 0,
      duration: 90,
      onComplete: () => {
        this.candy.disableBody(true, true);
        this.isEating = false;

        if (this.callbacks.onDeepNomTelemetry) {
          this.callbacks.onDeepNomTelemetry({
            mode: "duel",
            predictedX: this.deepNomPredictedX,
            timeRemaining: 0,
            aiScore: this.deepNomAiScore,
            humanScore: this.score,
            status: "AI_SCORED",
          });
        }

        this.time.delayedCall(400, () => {
          if (this.lives > 0 && this.playState === "playing") {
            const { width } = this.cameras.main;
            this.spawnCandy(Phaser.Math.Between(width * 0.2, width * 0.8), 45);
          }
        });
      },
    });
  }

  public init(data: {
    callbacks?: SceneCallbacks;
    initialLives?: number;
    initialSkin?: SkinId;
    initialToddlerMode?: boolean;
    rival?: { score: number; challenger: string };
    episodeId?: string | null;
    holderTierPerks?: {
      extraLives: number;
      scoreMultiplier: number;
      raidMultiplier: number;
      hasCrown: boolean;
    };
  }): void {
    if (data && typeof data.initialToddlerMode === "boolean") {
      this.toddlerMode = data.initialToddlerMode;
    }
    if (data && data.callbacks) {
      this.callbacks = data.callbacks;
    }
    if (data && data.holderTierPerks) {
      this.holderTierPerks = data.holderTierPerks;
    }
    const baseLives = (data && typeof data.initialLives === "number") ? data.initialLives : 5;
    this.lives = Math.min(this.maxCapLives, baseLives + (this.holderTierPerks?.extraLives || 0));
    this.nextLifeDropSeconds = 120;
    this.wingedLifeCandy = undefined;
    this.wingedHeartLabel = undefined;

    if (data && data.initialSkin) {
      this.currentSkin = data.initialSkin;
    }
    if (data && data.rival) {
      this.rival = data.rival;
      this.rivalBeaten = false;
    } else {
      this.rival = undefined;
      this.rivalBeaten = false;
    }

    if (data && data.episodeId) {
      this.currentEpisodeConfig = EPISODES.find((e) => e.id === data.episodeId);
      if (this.currentEpisodeConfig) {
        this.currentStageId = this.currentEpisodeConfig.stageEnvironment;
      }
    } else {
      this.currentEpisodeConfig = undefined;
    }

    this.score = 0;
    this.streak = 0;
    this.airJuggleCount = 0;
    this.feverMeter = 0;
    this.isFeverOverdrive = false;
    this.isFrenzy = false;
    this.isGameStarted = false;
    this.isDashReady = true;
    this.isInvulnerable = false;
    this.isBossDefeated = false;
    this.bossCurrentHp = 100;
    this.playState = "idle";
    this.activePowerUps = { magnet: false, shield: false, slowmo: false };

    if (this.callbacks.onGameStateChange) {
      this.callbacks.onGameStateChange("idle");
    }
    if (this.callbacks.onFeverMeterUpdate) {
      this.callbacks.onFeverMeterUpdate(0, false);
    }
    if (this.callbacks.onDashCooldownUpdate) {
      this.callbacks.onDashCooldownUpdate(true);
    }
  }

  public preload(): void {
    this.load.svg("nomster", "/mascot.svg", { width: 140, height: 140 });
    this.load.svg("candy", "/candy.svg", { width: 44, height: 44 });
    this.load.svg("star", "/favicon.svg", { width: 22, height: 22 });
  }

  public create(): void {
    const { width, height } = this.cameras.main;

    this.createProceduralTextures();

    // Background Gradient with Cyber Grid & Starfield
    this.bgGraphics = this.add.graphics();
    this.gridGraphics = this.add.graphics();
    this.sceneryGraphics = this.add.graphics();
    this.sceneryGraphics.setDepth(2);
    this.initStarfield();
    this.initScenery();
    this.updateStageEnvironment("meadow");

    this.aimGraphics = this.add.graphics();
    this.landingGuideGraphics = this.add.graphics();
    this.deepNomGraphics = this.add.graphics();
    this.deepNomGraphics.setDepth(18);

    // Floor Sensor Line (Bottom Out of Bounds pit between corner trampolines)
    const floorY = height - 12;
    const pitWidth = Math.max(100, width - 150);
    this.groundSensor = this.add.rectangle(width / 2, floorY, pitWidth, 24, 0xef4444, 0);
    this.physics.add.existing(this.groundSensor, true);

    // Bouncy Marshmallow Corner Trampolines (Second Chance Saves!)
    const trampY = height - 26;
    this.trampolineLeft = this.physics.add.staticSprite(46, trampY, "marshmallow_pad");
    this.trampolineLeft.setDepth(11);
    this.trampolineLeft.refreshBody();

    this.trampolineRight = this.physics.add.staticSprite(width - 46, trampY, "marshmallow_pad");
    this.trampolineRight.setDepth(11);
    this.trampolineRight.refreshBody();

    this.tweens.add({
      targets: [this.trampolineLeft, this.trampolineRight],
      scaleY: 1.05,
      scaleX: 0.95,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Nomster Setup at Bottom Center
    const nomsterY = height - 76;
    this.nomster = this.add.sprite(width / 2, nomsterY, "nomster");
    this.nomster.setOrigin(0.5, 0.85);
    this.nomster.setScale(1.0);
    this.nomster.setDepth(10);
    this.nomster.setInteractive({ cursor: "grab" });

    // Custom In-Game Skin Texture Injection from PixelSkinWorkshop
    if (typeof window !== "undefined") {
      try {
        const savedCustomSkin = localStorage.getItem("nomverse_custom_skin_data");
        if (savedCustomSkin) {
          const img = new Image();
          img.onload = () => {
            if (this.textures) {
              if (this.textures.exists("custom_pixel_skin")) {
                this.textures.remove("custom_pixel_skin");
              }
              this.textures.addImage("custom_pixel_skin", img);
              if (this.nomster && this.nomster.active) {
                this.nomster.setTexture("custom_pixel_skin");
                this.nomster.setDisplaySize(110, 110);
              }
            }
          };
          img.src = savedCustomSkin;
        }
      } catch {
        // ignore
      }

      window.addEventListener("nomverse_custom_skin_equipped", (e: Event) => {
        const customEvent = e as CustomEvent<{ dataUrl: string }>;
        const dataUrl = customEvent.detail?.dataUrl;
        if (dataUrl && this.textures) {
          const img = new Image();
          img.onload = () => {
            if (this.textures) {
              if (this.textures.exists("custom_pixel_skin")) {
                this.textures.remove("custom_pixel_skin");
              }
              this.textures.addImage("custom_pixel_skin", img);
              if (this.nomster && this.nomster.active) {
                this.nomster.setTexture("custom_pixel_skin");
                this.nomster.setDisplaySize(110, 110);
              }
            }
          };
          img.src = dataUrl;
        } else if (!dataUrl && this.nomster && this.nomster.active) {
          if (this.textures && this.textures.exists("custom_pixel_skin")) {
            this.textures.remove("custom_pixel_skin");
          }
          this.nomster.setTexture("nomster");
          this.nomster.setDisplaySize(110, 110);
        }
      });

      // Ghost Racer Personal Best Telemetry Spawn
      try {
        const rawGhost = localStorage.getItem("nomverse_best_ghost_trajectory");
        if (rawGhost) {
          this.ghostTrajectory = JSON.parse(rawGhost);
          if (this.ghostTrajectory.length > 0) {
            this.ghostNomster = this.add.sprite(width / 2, nomsterY, "nomster");
            this.ghostNomster.setOrigin(0.5, 0.85);
            this.ghostNomster.setAlpha(0.35);
            this.ghostNomster.setTint(0x00f0ff);
            this.ghostNomster.setDepth(8);
            this.ghostLabel = this.add.text(width / 2, nomsterY - 95, "BEST GHOST", {
              fontFamily: "monospace",
              fontSize: "9px",
              color: "#00f0ff",
              fontStyle: "bold",
            });
            this.ghostLabel.setOrigin(0.5, 0.5);
            this.ghostLabel.setAlpha(0.6);
            this.ghostLabel.setDepth(9);
          }
        }
      } catch {
        // ignore
      }
    }

    // Mascot Sleeping Eyes
    this.sleepingEyes = this.add.graphics();
    this.sleepingEyes.setDepth(14);
    this.sleepingEyes.setVisible(false);

    // Nomster Playful Tongue Sprite (Cute 3+ Kid Interaction)
    this.tongueSprite = this.add.sprite(width / 2, nomsterY - 24, "nomster_tongue");
    this.tongueSprite.setOrigin(0.5, 0.1);
    this.tongueSprite.setDepth(9);
    this.tongueSprite.setVisible(false);

    // Nomster Mouth Trigger Area (Generous catch zone: 48px standard, 80px in Toddler Mode)
    const mouthRadius = this.toddlerMode ? 80 : 48;
    this.mouthCollider = this.add.circle(width / 2, nomsterY - 34, mouthRadius, 0x000000, 0);
    this.physics.add.existing(this.mouthCollider, true);
    if (this.mouthCollider.body) {
      (this.mouthCollider.body as Phaser.Physics.Arcade.Body).setCircle(mouthRadius);
    }

    // Nomster Anticipation Mouth Glow
    this.mouthGlow = this.add.circle(width / 2, nomsterY - 34, 18, 0xf43f5e, 0.65);
    this.mouthGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.mouthGlow.setDepth(11);
    this.mouthGlow.setVisible(false);

    // Initialize DeepNom Neural Predictor Visual Objects
    this.initDeepNomObjects();

    // 2-Minute Winged Life Candy Drop Interval Timer
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.playState === "playing" && this.lives > 0) {
          this.nextLifeDropSeconds--;
          if (this.callbacks.onNextLifeDropCountdown) {
            this.callbacks.onNextLifeDropCountdown(this.nextLifeDropSeconds);
          }
          if (this.nextLifeDropSeconds <= 0) {
            this.nextLifeDropSeconds = 120;
            this.spawnWingedLifeCandy();
          }
        }
      },
    });

    // Expressive Eye-Tracking Pupils
    this.leftPupil = this.add.sprite(width / 2 - 18.5, nomsterY - 60, "pupil_sparkle");
    this.leftPupil.setOrigin(0.5, 0.5);
    this.leftPupil.setDepth(12);

    this.rightPupil = this.add.sprite(width / 2 + 18.5, nomsterY - 60, "pupil_sparkle");
    this.rightPupil.setOrigin(0.5, 0.5);
    this.rightPupil.setDepth(12);

    // Bubble Gum Shield Sprite
    this.shieldSprite = this.add.sprite(width / 2, nomsterY - 40, "shield_bubble");
    this.shieldSprite.setVisible(false);
    this.shieldSprite.setAlpha(0.85);
    this.shieldSprite.setDepth(16);

    this.tweens.add({
      targets: this.shieldSprite,
      scaleX: 1.08,
      scaleY: 1.08,
      alpha: 0.95,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Equipped Cosmetic Accessory Sprite
    this.accessorySprite = this.add.sprite(width / 2, nomsterY, "skin_shades");
    this.accessorySprite.setVisible(false);
    this.accessorySprite.setDepth(15);
    this.updateAccessoryVisual();

    // Idle Breathing
    this.updateNomsterMood();

    // Floating Red FUD Glitch Hazard
    this.spawnFUDHazard();

    // Setup Initial Candy Sprite (held in inactive pool until game starts)
    this.initCandySprite();

    // Setup Interactive Controls
    this.setupInteractivity();

    // 60FPS Continuous Keyboard Controls Setup
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    // Spawn In-Game Lord Mega-FUD Boss if Boss Episode
    if (this.currentEpisodeConfig?.isBossEpisode) {
      this.spawnBoss();
    }

    // Collisions & Overlaps
    this.physics.add.overlap(this.candy, this.mouthCollider, () => {
      this.handleEatCandy();
    });

    // Bouncy Marshmallow Corner Trampoline Overlaps
    if (this.trampolineLeft) {
      this.physics.add.overlap(this.candy, this.trampolineLeft, () => {
        this.handleTrampolineBounce(this.trampolineLeft!, true);
      });
    }
    if (this.trampolineRight) {
      this.physics.add.overlap(this.candy, this.trampolineRight, () => {
        this.handleTrampolineBounce(this.trampolineRight!, false);
      });
    }

    this.physics.add.overlap(this.candy, this.groundSensor, () => {
      this.handleMissCandy();
    });

    this.physics.add.overlap(this.candy, this.fudHazard, () => {
      this.handleHitFUD();
    });

    // Show on-canvas Start Prompt
    this.showStartPrompt();

    if (this.rival) {
      this.renderRivalBanner();
    }

    if (this.callbacks.onLivesUpdate) {
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  // Update loop for Starfield, Eye Tracking, Mouth Anticipation, Trails, Keyboard, and Magnetic Pull
  public override update(time: number, delta: number): void {
    if (!this.nomster) return;

    const dt = delta / 1000;
    const { width: camWidth, height: camHeight } = this.cameras.main;

    // --- DEEPNOM BALLISTIC NEURAL PREDICTOR & AUTOPILOT ---
    if (this.deepNomMode !== "off" && this.deepNomGraphics) {
      this.deepNomGraphics.clear();

      if (
        this.candy &&
        this.candy.active &&
        this.candy.body &&
        this.playState === "playing" &&
        this.lives > 0
      ) {
        const candyBody = this.candy.body as Phaser.Physics.Arcade.Body;
        const x0 = this.candy.x;
        const y0 = this.candy.y;
        const vx = candyBody.velocity.x;
        const vy = candyBody.velocity.y;
        const g = (candyBody.gravity.y || this.getStageGravity()) + this.physics.world.gravity.y;
        const mouthY = camHeight - 110;

        if (y0 < mouthY && g > 0) {
          const disc = vy * vy + 2 * g * (mouthY - y0);
          if (disc >= 0) {
            const tImpact = (-vy + Math.sqrt(disc)) / g;
            this.deepNomTimeRemaining = tImpact;

            const minX = 26;
            const maxX = camWidth - 26;
            const L = maxX - minX;

            const rawX = (x0 - minX) + vx * tImpact;
            const modX = ((rawX % (2 * L)) + 2 * L) % (2 * L);
            const predictedX = (modX < L ? modX : (2 * L - modX)) + minX;
            this.deepNomPredictedX = predictedX;

            // Draw Ballistic Laser Trajectory Arc (16 sub-steps with wall reflections)
            const steps = 16;
            let prevX = x0;
            let prevY = y0;

            for (let i = 1; i <= steps; i++) {
              const ti = tImpact * (i / steps);
              const curY = y0 + vy * ti + 0.5 * g * ti * ti;
              const curRawX = (x0 - minX) + vx * ti;
              const curModX = ((curRawX % (2 * L)) + 2 * L) % (2 * L);
              const curX = (curModX < L ? curModX : (2 * L - curModX)) + minX;

              const isNearWall = curX <= minX + 6 || curX >= maxX - 6;
              const arcColor = this.deepNomMode === "duel" ? 0xff007f : 0x00f0ff;

              // Outer laser glow
              this.deepNomGraphics.lineStyle(3, arcColor, 0.28);
              this.deepNomGraphics.lineBetween(prevX, prevY, curX, curY);

              // Inner laser beam
              this.deepNomGraphics.lineStyle(1.5, 0xffffff, 0.9);
              this.deepNomGraphics.lineBetween(prevX, prevY, curX, curY);

              // Bead at vertex or wall bounce
              if (isNearWall || i === steps || i % 4 === 0) {
                this.deepNomGraphics.fillStyle(arcColor, 0.95);
                this.deepNomGraphics.fillCircle(curX, curY, isNearWall ? 4 : 2.5);
              }

              prevX = curX;
              prevY = curY;
            }

            // Holographic Target Reticle
            if (this.deepNomReticleOuter && this.deepNomReticleInner) {
              this.deepNomReticleOuter.setPosition(predictedX, mouthY);
              this.deepNomReticleInner.setPosition(predictedX, mouthY);
              this.deepNomReticleOuter.setVisible(true);
              this.deepNomReticleInner.setVisible(true);

              const reticleColor = this.deepNomMode === "duel" ? 0xff007f : 0x00f0ff;
              this.deepNomReticleOuter.setStrokeStyle(2, reticleColor, 0.85);
              this.deepNomReticleInner.setFillStyle(reticleColor, 0.95);

              // Pulsate and rotate reticle
              this.deepNomReticleOuter.setScale(1.0 + Math.sin(time * 0.008) * 0.18);

              // Crosshairs
              this.deepNomGraphics.lineStyle(1.5, reticleColor, 0.75);
              this.deepNomGraphics.lineBetween(predictedX - 16, mouthY, predictedX + 16, mouthY);
              this.deepNomGraphics.lineBetween(predictedX, mouthY - 16, predictedX, mouthY + 16);
            }

            // HUD Text Readout
            if (this.deepNomHudText) {
              this.deepNomHudText.setPosition(predictedX, mouthY - 30);
              this.deepNomHudText.setText(
                `TARGET: X=${Math.round(predictedX)} T=${tImpact.toFixed(2)}s P=99.8%`
              );
              this.deepNomHudText.setColor(this.deepNomMode === "duel" ? "#ff007f" : "#00f0ff");
              this.deepNomHudText.setVisible(true);
            }

            // Telemetry Callback
            if (this.callbacks.onDeepNomTelemetry) {
              this.callbacks.onDeepNomTelemetry({
                mode: this.deepNomMode,
                predictedX,
                timeRemaining: tImpact,
                aiScore: this.deepNomAiScore,
                humanScore: this.score,
                status: "CALCULATING_60FPS",
              });
            }

            // --- AUTONOMOUS ACTION ---
            if (this.deepNomMode === "autopilot" && !this.isMovingNomster) {
              this.wakeNomster();
              const dx = predictedX - this.nomster.x;
              const absDx = Math.abs(dx);

              // Automatic Super Dash if candy is far and dropping fast
              if (absDx > 85 && tImpact < 0.45 && this.isDashReady) {
                nomsterVoice.speakSuperDash();
                this.performSuperDash();
              }

              if (absDx > 6) {
                const dir = Math.sign(dx);
                this.nomsterVelocityX = Phaser.Math.Clamp(
                  this.nomsterVelocityX + dir * this.nomsterAccel * dt * 1.35,
                  -this.maxNomsterSpeed * 1.15,
                  this.maxNomsterSpeed * 1.15
                );
              } else {
                this.nomsterVelocityX *= 0.65;
              }
            } else if (this.deepNomMode === "duel" && this.deepNomOpponent) {
              // AI Opponent steering
              const aiDx = predictedX - this.deepNomOpponent.x;
              const absAiDx = Math.abs(aiDx);
              if (absAiDx > 8) {
                const aiDir = Math.sign(aiDx);
                const aiSpeed = 380;
                this.deepNomOpponent.x = Phaser.Math.Clamp(
                  this.deepNomOpponent.x + aiDir * aiSpeed * dt,
                  60,
                  camWidth - 60
                );
                this.deepNomOpponent.angle = aiDir * 9;
              } else {
                this.deepNomOpponent.angle = Phaser.Math.Linear(this.deepNomOpponent.angle, 0, dt * 10);
              }

              if (this.deepNomOpponentLabel) {
                this.deepNomOpponentLabel.setPosition(this.deepNomOpponent.x, this.deepNomOpponent.y - 95);
                this.deepNomOpponentLabel.setText(`DEEPNOM AI [${this.deepNomAiScore}]`);
              }
              if (this.deepNomOpponentMouthCollider) {
                this.deepNomOpponentMouthCollider.setPosition(
                  this.deepNomOpponent.x,
                  this.deepNomOpponent.y - 34
                );
              }
            }
          }
        }
      } else {
        if (this.deepNomReticleOuter) this.deepNomReticleOuter.setVisible(false);
        if (this.deepNomReticleInner) this.deepNomReticleInner.setVisible(false);
        if (this.deepNomHudText) this.deepNomHudText.setVisible(false);
      }
    }

    // 0. 60FPS Continuous Velocity Keyboard Controller
    if (
      this.playState === "playing" ||
      this.playState === "countdown" ||
      this.playState === "respawning"
    ) {
      if (this.cursors && this.keyA && this.keyD) {
        let moveDir = 0;
        if (this.cursors.left.isDown || this.keyA.isDown) moveDir -= 1;
        if (this.cursors.right.isDown || this.keyD.isDown) moveDir += 1;

        if (moveDir !== 0) {
          this.wakeNomster();
          this.nomsterVelocityX = Phaser.Math.Clamp(
            this.nomsterVelocityX + moveDir * this.nomsterAccel * dt,
            -this.maxNomsterSpeed,
            this.maxNomsterSpeed
          );
        } else if (
          this.toddlerMode &&
          !this.isMovingNomster &&
          this.candy &&
          this.candy.active &&
          !this.isEating &&
          this.candy.y > 60
        ) {
          // Toddler Auto-Waddle Assist: Nomster happily scampers under candy to help young kids
          const diff = this.candy.x - this.nomster.x;
          if (Math.abs(diff) > 8) {
            const assistSpeed = 240;
            this.nomsterVelocityX = Math.sign(diff) * assistSpeed;
          } else {
            this.nomsterVelocityX = 0;
          }
        } else {
          // Friction damping
          if (this.nomsterVelocityX > 0) {
            this.nomsterVelocityX = Math.max(0, this.nomsterVelocityX - this.nomsterDrag * dt);
          } else if (this.nomsterVelocityX < 0) {
            this.nomsterVelocityX = Math.min(0, this.nomsterVelocityX + this.nomsterDrag * dt);
          }
        }

        // Apply velocity to Nomster position and banking tilt
        if (Math.abs(this.nomsterVelocityX) > 8 && !this.isMovingNomster) {
          this.nomster.x = Phaser.Math.Clamp(
            this.nomster.x + this.nomsterVelocityX * dt,
            60,
            camWidth - 60
          );
          this.nomster.angle = (this.nomsterVelocityX / this.maxNomsterSpeed) * 11;
        } else if (!this.isMovingNomster && Math.abs(this.nomster.angle) > 0.5) {
          this.nomster.angle = Phaser.Math.Linear(this.nomster.angle, 0, dt * 10);
        }

        // Ghost Racer Telemetry Sampling & Replay
        if (this.playState === "playing") {
          if (!this.runStartTime) this.runStartTime = Date.now();
          const elapsed = Date.now() - this.runStartTime;

          if (Date.now() - this.lastTrajectorySampleTime > 100) {
            this.lastTrajectorySampleTime = Date.now();
            this.currentRunTrajectory.push({ t: elapsed, x: this.nomster.x });
          }

          if (this.ghostNomster && this.ghostTrajectory.length > 0) {
            const targetFrame = this.ghostTrajectory.find((pt) => pt.t >= elapsed);
            if (targetFrame) {
              this.ghostNomster.x = Phaser.Math.Linear(this.ghostNomster.x, targetFrame.x, 0.25);
              if (this.ghostLabel) {
                this.ghostLabel.x = this.ghostNomster.x;
              }
            }
          }
        }

        // Spacebar / Shift triggers Super Dash
        if (
          Phaser.Input.Keyboard.JustDown(this.keySpace) ||
          Phaser.Input.Keyboard.JustDown(this.keyShift)
        ) {
          this.wakeNomster();
          this.performSuperDash();
        }

        // Up arrow / W triggers Leap & Air Juggle
        if (
          Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          Phaser.Input.Keyboard.JustDown(this.keyW)
        ) {
          this.wakeNomster();
          this.performAirJuggle();
        }
      }
    }

    // 1. Drifting Cosmic Starfield Parallax
    if (this.stars && this.stars.length > 0) {
      for (const star of this.stars) {
        star.circle.y -= star.speed * dt;
        if (star.circle.y < -5) {
          star.circle.y = camHeight + 5;
          star.circle.x = Phaser.Math.Between(0, camWidth);
        }
      }
    }

    // 1b. Living Parallax Scenery Updates (Clouds, Fireflies, Moon, Warp)
    if (this.currentStageId === "meadow" && this.clouds && this.clouds.length > 0) {
      for (const cloud of this.clouds) {
        cloud.sprite.x += cloud.speed * dt;
        if (cloud.sprite.x > camWidth + 60) {
          cloud.sprite.x = -60;
        }
      }
    }

    if (this.currentStageId === "meadow" && this.fireflies && this.fireflies.length > 0) {
      for (const f of this.fireflies) {
        f.arc.x = f.baseX + Math.sin(f.phase + time * 0.0015 * f.speed) * 16;
        f.arc.y = f.baseY + Math.cos(f.phase + time * 0.002 * f.speed) * 10;
      }
    }

    if (this.currentStageId === "moon" && this.celestialMoon && this.celestialMoon.visible) {
      this.celestialMoon.y = 85 + Math.sin(time * 0.0012) * 5;
    }

    if (this.currentStageId === "hyperdrive" && this.warpLines && this.warpLines.length > 0) {
      const centerX = camWidth / 2;
      const centerY = camHeight * 0.35;
      for (const w of this.warpLines) {
        w.dist += w.speed * dt;
        if (w.dist > 260) {
          w.dist = 20;
        }
        const x1 = centerX + Math.cos(w.angle) * w.dist;
        const y1 = centerY + Math.sin(w.angle) * w.dist;
        const len = 12 + (w.dist / 260) * 24;
        const x2 = centerX + Math.cos(w.angle) * (w.dist + len);
        const y2 = centerY + Math.sin(w.angle) * (w.dist + len);
        w.line.setTo(x1, y1, x2, y2);
      }
    }

    // Keep mouth collider synced
    this.mouthCollider.x = this.nomster.x;

    // 2. Eye Tracking & Expressive Pupil Following
    const rad = Phaser.Math.DegToRad(this.nomster.angle);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const offsetLX = -18.5;
    const offsetLY = -60;
    const offsetRX = 18.5;
    const offsetRY = -60;

    const baseLX = this.nomster.x + (offsetLX * cos - offsetLY * sin);
    const baseLY = this.nomster.y + (offsetLX * sin + offsetLY * cos);
    const baseRX = this.nomster.x + (offsetRX * cos - offsetRY * sin);
    const baseRY = this.nomster.y + (offsetRX * sin + offsetRY * cos);

    let lookTargetX = baseLX;
    let lookTargetY = baseLY - 120;

    if (this.candy && this.candy.active && this.lives > 0) {
      lookTargetX = this.candy.x;
      lookTargetY = this.candy.y;
    }

    const maxPupilOffset = 4.5;

    const ldx = lookTargetX - baseLX;
    const ldy = lookTargetY - baseLY;
    const ldist = Math.sqrt(ldx * ldx + ldy * ldy) || 1;
    const pupilLX = baseLX + (ldx / ldist) * Math.min(maxPupilOffset, ldist * 0.05);
    const pupilLY = baseLY + (ldy / ldist) * Math.min(maxPupilOffset, ldist * 0.05);

    const rdx = lookTargetX - baseRX;
    const rdy = lookTargetY - baseRY;
    const rdist = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
    const pupilRX = baseRX + (rdx / rdist) * Math.min(maxPupilOffset, rdist * 0.05);
    const pupilRY = baseRY + (rdy / rdist) * Math.min(maxPupilOffset, rdist * 0.05);

    if (!this.isNapping) {
      if (this.leftPupil) {
        this.leftPupil.setPosition(pupilLX, pupilLY);
        this.leftPupil.setAngle(this.nomster.angle);
      }
      if (this.rightPupil) {
        this.rightPupil.setPosition(pupilRX, pupilRY);
        this.rightPupil.setAngle(this.nomster.angle);
      }
    }

    // 3. Mouth Anticipation Stretch when candy descends close overhead
    if (this.candy && this.candy.active && !this.isEating && this.playState === "playing") {
      const mdx = this.candy.x - this.mouthCollider.x;
      const mdy = this.candy.y - this.mouthCollider.y;
      const distToMouth = Math.sqrt(mdx * mdx + mdy * mdy);

      if (distToMouth < 130 && mdy < 0) {
        if (!this.isAnticipating) {
          this.isAnticipating = true;
          this.tweens.add({
            targets: this.nomster,
            scaleY: 1.14,
            scaleX: 0.90,
            duration: 120,
            ease: "Back.easeOut",
          });
          if (this.mouthGlow) {
            this.mouthGlow.setVisible(true);
            this.tweens.add({
              targets: this.mouthGlow,
              scale: 1.35,
              alpha: 0.85,
              duration: 140,
              yoyo: true,
              repeat: -1,
            });
          }
        }
      } else if (distToMouth >= 155 && this.isAnticipating) {
        this.isAnticipating = false;
        if (this.mouthGlow) {
          this.tweens.killTweensOf(this.mouthGlow);
          this.mouthGlow.setVisible(false);
        }
        this.tweens.add({
          targets: this.nomster,
          scaleY: 1.0,
          scaleX: 1.0,
          duration: 140,
          ease: "Quad.easeOut",
          onComplete: () => {
            if (!this.isEating) this.updateNomsterMood();
          },
        });
      }
    }

    if (this.mouthGlow && this.mouthGlow.visible) {
      const mouthOffsetX = 0;
      const mouthOffsetY = -34;
      const mouthX = this.nomster.x + (mouthOffsetX * cos - mouthOffsetY * sin);
      const mouthY = this.nomster.y + (mouthOffsetX * sin + mouthOffsetY * cos);
      this.mouthGlow.setPosition(mouthX, mouthY);
    }

    // Nomster Tongue Anticipation Flick
    if (this.tongueSprite) {
      if (this.candy && this.candy.active && !this.isEating && this.playState === "playing") {
        const mdx = this.candy.x - this.mouthCollider.x;
        const mdy = this.candy.y - this.mouthCollider.y;
        const distToMouth = Math.sqrt(mdx * mdx + mdy * mdy);

        if (distToMouth < 130 && mdy < 0) {
          this.tongueSprite.setVisible(true);
          this.tongueSprite.setPosition(this.nomster.x, this.nomster.y - 32);
          const progress = Phaser.Math.Clamp((130 - distToMouth) / 130, 0, 1);
          this.tongueSprite.setScale(1.0 + progress * 0.25, 0.4 + progress * 0.95);
          const angleToCandy = Phaser.Math.RadToDeg(Math.atan2(mdy, mdx)) + 90;
          this.tongueSprite.setAngle(Phaser.Math.Clamp(angleToCandy, -24, 24) + this.nomster.angle);
        } else {
          this.tongueSprite.setVisible(false);
        }
      } else {
        this.tongueSprite.setVisible(false);
      }
    }

    // Soft Landing Guide Beam & Target Shadow
    if (this.landingGuideGraphics) {
      this.landingGuideGraphics.clear();
      if (this.candy && this.candy.active && this.playState === "playing" && this.candy.body) {
        const floorY = camHeight - 12;
        this.landingGuideGraphics.lineStyle(1.5, 0x14f195, 0.25);
        this.landingGuideGraphics.lineBetween(this.candy.x, this.candy.y + 18, this.candy.x, floorY);

        this.landingGuideGraphics.fillStyle(0x14f195, 0.2);
        this.landingGuideGraphics.fillEllipse(this.candy.x, floorY - 3, 34, 7);
        this.landingGuideGraphics.lineStyle(1.5, 0x14f195, 0.5);
        this.landingGuideGraphics.strokeEllipse(this.candy.x, floorY - 3, 34, 7);
      }
    }

    // Winged Heart Label Sync
    if (this.wingedLifeCandy && this.wingedLifeCandy.active && this.wingedHeartLabel) {
      this.wingedHeartLabel.setPosition(this.wingedLifeCandy.x, this.wingedLifeCandy.y - 26);
    }

    // 4. Glowing Candy Particle Trails
    if (this.candy && this.candy.active && this.candy.body && this.candy.body.velocity) {
      const speed = this.candy.body.velocity.length();
      if (speed > 45 && Math.random() < 0.4) {
        const trailColor = this.isFrenzy
          ? 0xf59e0b
          : this.currentPowerUpType === "magnet"
          ? 0x9945ff
          : this.currentPowerUpType === "slowmo"
          ? 0x06b6d4
          : this.currentPowerUpType === "shield"
          ? 0xec4899
          : 0x14f195;

        const trail = this.add.circle(
          this.candy.x + Phaser.Math.Between(-4, 4),
          this.candy.y + Phaser.Math.Between(-4, 4),
          Phaser.Math.Between(2, 4),
          trailColor,
          0.75
        );
        trail.setBlendMode(Phaser.BlendModes.ADD);
        trail.setDepth(5);
        this.tweens.add({
          targets: trail,
          alpha: 0,
          scale: 0.1,
          duration: 250,
          ease: "Sine.easeOut",
          onComplete: () => trail.destroy(),
        });
      }
    }

    // Keep accessory synchronized with Nomster movement and tilt
    if (this.accessorySprite && this.accessorySprite.visible) {
      const offset = this.getSkinOffset(this.currentSkin);
      const rotatedOffsetX = offset.x * cos - offset.y * sin;
      const rotatedOffsetY = offset.x * sin + offset.y * cos;

      this.accessorySprite.setPosition(
        this.nomster.x + rotatedOffsetX,
        this.nomster.y + rotatedOffsetY
      );
      this.accessorySprite.setAngle(this.nomster.angle);
      this.accessorySprite.setScale(this.nomster.scaleX, this.nomster.scaleY);
      this.accessorySprite.setAlpha(this.nomster.alpha);
    }

    // Keep shield bubble synchronized
    if (this.shieldSprite && this.shieldSprite.visible) {
      this.shieldSprite.setPosition(this.nomster.x, this.nomster.y - 40);
    }

    // Keep candy power-up badge floating above candy
    if (this.candyLabel && this.candyLabel.visible && this.candy) {
      this.candyLabel.setPosition(this.candy.x, this.candy.y - 28);
    }

    // Golden aura sparks during NOM-RAGE Fever Overdrive
    if (this.isFeverOverdrive && Math.random() < 0.4) {
      const fSpark = this.add.circle(
        this.nomster.x + Phaser.Math.Between(-30, 30),
        this.nomster.y - Phaser.Math.Between(10, 60),
        Phaser.Math.Between(2, 4),
        0xf59e0b,
        0.85
      );
      fSpark.setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: fSpark,
        y: fSpark.y - 28,
        alpha: 0,
        duration: 260,
        onComplete: () => fSpark.destroy(),
      });
    }

    // Solana Magnet, NOM-RAGE Fever Overdrive, Toddler Mode, or Natural Catch Vacuum
    const isFullMagnet = this.activePowerUps.magnet || this.isFeverOverdrive;
    const isToddlerVacuum = this.toddlerMode;
    const suctionRange = isFullMagnet ? 420 : isToddlerVacuum ? 260 : 100;

    if (
      this.candy &&
      !this.isEating &&
      this.lives > 0 &&
      this.candy.active
    ) {
      const dx = this.mouthCollider.x - this.candy.x;
      const dy = this.mouthCollider.y - this.candy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 12 && dist < suctionRange && this.candy.y < this.mouthCollider.y + 20) {
        const pullFactor = isFullMagnet ? 290 : isToddlerVacuum ? 320 : 190;
        const currentVx = this.candy.body?.velocity.x || 0;
        const currentVy = this.candy.body?.velocity.y || 0;
        const targetVx = (dx / dist) * pullFactor;
        const targetVy = Math.max((dy / dist) * pullFactor, isToddlerVacuum ? 80 : 110);

        const lerpFactor = isToddlerVacuum ? 0.22 : 0.14;
        this.candy.setVelocity(
          currentVx * (1 - lerpFactor) + targetVx * lerpFactor,
          currentVy * (1 - lerpFactor) + targetVy * lerpFactor
        );

        // Gentle spark trail
        if (Math.random() < (isToddlerVacuum ? 0.35 : 0.2)) {
          const sparkColor = isToddlerVacuum
            ? Phaser.Utils.Array.GetRandom([0x14f195, 0xf59e0b, 0xf472b6, 0x38bdf8])
            : 0x9945ff;
          const spark = this.add.circle(
            this.candy.x + Phaser.Math.Between(-8, 8),
            this.candy.y + Phaser.Math.Between(-8, 8),
            isToddlerVacuum ? 3 : 2,
            sparkColor,
            0.85
          );
          this.tweens.add({
            targets: spark,
            alpha: 0,
            y: spark.y + (isToddlerVacuum ? -16 : 15),
            duration: 250,
            onComplete: () => spark.destroy(),
          });
        }
      }
    }

    // Sync Soap Bubble position with Candy
    if (this.bubbleSprite && this.bubbleSprite.visible && this.candy && this.candy.active) {
      this.bubbleSprite.setPosition(this.candy.x, this.candy.y);
      this.bubbleSprite.setAngle(this.candy.angle);
    }

    // 5. Living Mascot Moods & Idle Napping
    if (
      this.playState !== "gameover" &&
      this.lives > 0 &&
      time - this.lastInputTime > 9000
    ) {
      if (!this.isNapping) {
        this.isNapping = true;
        if (this.leftPupil) this.leftPupil.setVisible(false);
        if (this.rightPupil) this.rightPupil.setVisible(false);
        if (this.tongueSprite) this.tongueSprite.setVisible(false);
      }

      // Draw sleeping curved closed eyes: (⌒ ⌒)
      if (this.sleepingEyes) {
        this.sleepingEyes.setVisible(true);
        this.sleepingEyes.clear();
        this.sleepingEyes.lineStyle(2.5, 0x090d16, 0.9);

        const sRad = Phaser.Math.DegToRad(this.nomster.angle);
        const sCos = Math.cos(sRad);
        const sSin = Math.sin(sRad);

        const leftEyeX = this.nomster.x + (-18.5 * sCos - -60 * sSin);
        const leftEyeY = this.nomster.y + (-18.5 * sSin + -60 * sCos);
        const rightEyeX = this.nomster.x + (18.5 * sCos - -60 * sSin);
        const rightEyeY = this.nomster.y + (18.5 * sSin + -60 * sCos);

        this.sleepingEyes.beginPath();
        this.sleepingEyes.arc(leftEyeX, leftEyeY + 3, 6, Math.PI * 1.15, Math.PI * 1.85);
        this.sleepingEyes.stroke();

        this.sleepingEyes.beginPath();
        this.sleepingEyes.arc(rightEyeX, rightEyeY + 3, 6, Math.PI * 1.15, Math.PI * 1.85);
        this.sleepingEyes.stroke();
      }

      // Float gentle "Zzz" sleep bubble every 1.8s
      if (time > this.nextZzzTime) {
        this.nextZzzTime = time + 1800;
        const zzzText = this.add.text(
          this.nomster.x + Phaser.Math.Between(12, 24),
          this.nomster.y - 70,
          "Zzz...",
          {
            fontFamily: "monospace",
            fontSize: "14px",
            fontStyle: "bold",
            color: "#c084fc",
            stroke: "#050914",
            strokeThickness: 3,
          }
        );
        zzzText.setOrigin(0.5);
        zzzText.setDepth(28);
        this.tweens.add({
          targets: zzzText,
          y: zzzText.y - 45,
          x: zzzText.x + Phaser.Math.Between(10, 25),
          alpha: 0,
          scale: 1.25,
          duration: 1500,
          ease: "Sine.easeOut",
          onComplete: () => zzzText.destroy(),
        });
      }
    } else if (this.isNapping) {
      this.wakeNomster();
    }
  }

  // Spawns drifting cosmic stardust particles with parallax speeds
  private initStarfield(): void {
    const { width, height } = this.cameras.main;
    this.stars = [];
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const radius = Phaser.Math.FloatBetween(1, 2.6);
      const speed = Phaser.Math.FloatBetween(14, 40);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.85);
      const circle = this.add.circle(x, y, radius, 0x14f195, alpha);
      circle.setDepth(1);
      this.stars.push({ circle, speed });
    }
  }

  // Initializes dynamic living scenery: clouds, fireflies, moon, skyline, and warp streaks
  private initScenery(): void {
    const { width, height } = this.cameras.main;

    // 1. Drifting Clouds (Stage 1 Meadow)
    this.clouds = [];
    const cloudYs = [42, 88, 134];
    const cloudSpeeds = [7, 12, 17];
    for (let i = 0; i < 3; i++) {
      const cloud = this.add.sprite(
        Phaser.Math.Between(0, width),
        cloudYs[i],
        "cloud_puff"
      );
      cloud.setDepth(2);
      cloud.setAlpha(0.65);
      cloud.setScale(Phaser.Math.FloatBetween(0.85, 1.15));
      this.clouds.push({ sprite: cloud, speed: cloudSpeeds[i] });
    }

    // 2. Ambient Bioluminescent Fireflies (Stage 1 Meadow)
    this.fireflies = [];
    for (let i = 0; i < 9; i++) {
      const bx = Phaser.Math.Between(24, width - 24);
      const by = Phaser.Math.Between(height * 0.42, height - 60);
      const arc = this.add.circle(bx, by, Phaser.Math.FloatBetween(2, 3.5), 0xbef264, 0.75);
      arc.setDepth(3);
      arc.setBlendMode(Phaser.BlendModes.ADD);
      this.fireflies.push({
        arc,
        baseX: bx,
        baseY: by,
        phase: Math.random() * Math.PI * 2,
        speed: Phaser.Math.FloatBetween(0.8, 2.0),
      });
    }

    // 3. Giant Celestial Solana Moon Orb (Stage 2 Moon)
    this.celestialMoon = this.add.sprite(width * 0.76, 85, "celestial_moon");
    this.celestialMoon.setDepth(2);
    this.celestialMoon.setVisible(false);

    // 4. Cyber Skyline (Stage 3 Matrix)
    this.cyberSkyline = this.add.sprite(width / 2, height - 105, "cyber_skyline");
    this.cyberSkyline.setDepth(2);
    this.cyberSkyline.setVisible(false);

    // 5. Warp Streaks (Stage 4 Hyper-Drive)
    this.warpLines = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI * 2) / 20;
      const line = this.add.line(width / 2, height * 0.35, 0, 0, 16, 0, 0xf59e0b, 0.6);
      line.setDepth(2);
      line.setVisible(false);
      this.warpLines.push({
        line,
        speed: Phaser.Math.FloatBetween(130, 260),
        angle,
        dist: Phaser.Math.FloatBetween(20, 180),
      });
    }
  }

  // Safe cross-browser canvas rounded rect helper (polyfilled for all engines)
  private drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  // Generates 2D canvas textures for skins, shield, and pupils
  private createProceduralTextures(): void {
    // 0. Expressive Pupil with Specular Highlights
    if (!this.textures.exists("pupil_sparkle")) {
      const canvas = this.textures.createCanvas("pupil_sparkle", 16, 16);
      if (canvas) {
        const ctx = canvas.context;
        // Dark pupil core
        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.arc(8, 8, 7, 0, Math.PI * 2);
        ctx.fill();
        // Inner cyber-emerald rim glint
        ctx.fillStyle = "#14f195";
        ctx.beginPath();
        ctx.arc(8, 8, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.arc(8, 8, 4.2, 0, Math.PI * 2);
        ctx.fill();
        // Specular white cartoon shines
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(6, 6, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10.5, 10.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        canvas.refresh();
      }
    }

    // 1. Shades
    if (!this.textures.exists("skin_shades")) {
      const canvas = this.textures.createCanvas("skin_shades", 72, 24);
      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = "#090d16";
        ctx.fillRect(4, 4, 64, 16);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(8, 6, 24, 12);
        ctx.fillRect(40, 6, 24, 12);
        // Neon green & magenta pixel glint
        ctx.fillStyle = "#14f195";
        ctx.fillRect(10, 8, 8, 3);
        ctx.fillRect(42, 8, 8, 3);
        ctx.fillStyle = "#9945ff";
        ctx.fillRect(16, 12, 12, 3);
        ctx.fillRect(48, 12, 12, 3);
        canvas.refresh();
      }
    }

    // 2. Dev Cap
    if (!this.textures.exists("skin_cap")) {
      const canvas = this.textures.createCanvas("skin_cap", 76, 42);
      if (canvas) {
        const ctx = canvas.context;
        // Cap dome
        ctx.fillStyle = "#9945ff";
        ctx.beginPath();
        ctx.arc(38, 34, 26, Math.PI, 0, false);
        ctx.fill();
        // Backward visor
        ctx.fillStyle = "#14f195";
        ctx.beginPath();
        ctx.ellipse(38, 32, 32, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Top golden button
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(38, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        canvas.refresh();
      }
    }

    // 3. Golden Crown
    if (!this.textures.exists("skin_crown")) {
      const canvas = this.textures.createCanvas("skin_crown", 70, 40);
      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(6, 36);
        ctx.lineTo(6, 14);
        ctx.lineTo(22, 24);
        ctx.lineTo(35, 4); // tall middle crown peak
        ctx.lineTo(48, 24);
        ctx.lineTo(64, 14);
        ctx.lineTo(64, 36);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#fcd34d";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Jewels
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(6, 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#14f195";
        ctx.beginPath();
        ctx.arc(35, 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#9945ff";
        ctx.beginPath();
        ctx.arc(64, 12, 3, 0, Math.PI * 2);
        ctx.fill();
        canvas.refresh();
      }
    }

    // 4. Bubble Gum Shield
    if (!this.textures.exists("shield_bubble")) {
      const canvas = this.textures.createCanvas("shield_bubble", 124, 124);
      if (canvas) {
        const ctx = canvas.context;
        const grad = ctx.createRadialGradient(62, 62, 10, 62, 62, 58);
        grad.addColorStop(0, "rgba(0, 194, 255, 0.05)");
        grad.addColorStop(0.7, "rgba(0, 194, 255, 0.25)");
        grad.addColorStop(1, "rgba(20, 241, 149, 0.65)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(62, 62, 56, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#00c2ff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Highlight shine
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(62, 62, 48, -Math.PI * 0.75, -Math.PI * 0.35);
        ctx.stroke();
        canvas.refresh();
      }
    }

    // 5. FUD Slayer Horns
    if (!this.textures.exists("skin_horns")) {
      const canvas = this.textures.createCanvas("skin_horns", 84, 44);
      if (canvas) {
        const ctx = canvas.context;
        // Left horn
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(24, 38);
        ctx.quadraticCurveTo(12, 20, 6, 4);
        ctx.quadraticCurveTo(18, 16, 32, 34);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Right horn
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(60, 38);
        ctx.quadraticCurveTo(72, 20, 78, 4);
        ctx.quadraticCurveTo(66, 16, 52, 34);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 2;
        ctx.stroke();

        canvas.refresh();
      }
    }

    // 6. Diamondbag Nomster Crystal Crown & Gems
    if (!this.textures.exists("skin_diamond")) {
      const canvas = this.textures.createCanvas("skin_diamond", 78, 44);
      if (canvas) {
        const ctx = canvas.context;
        // Central crystalline diamond
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.moveTo(39, 4);
        ctx.lineTo(58, 20);
        ctx.lineTo(48, 38);
        ctx.lineTo(30, 38);
        ctx.lineTo(20, 20);
        ctx.closePath();
        ctx.fill();

        // Facet lines
        ctx.fillStyle = "#e0f7fa";
        ctx.beginPath();
        ctx.moveTo(39, 4);
        ctx.lineTo(30, 20);
        ctx.lineTo(48, 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#00b0ff";
        ctx.beginPath();
        ctx.moveTo(30, 20);
        ctx.lineTo(39, 38);
        ctx.lineTo(48, 20);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, 20);
        ctx.lineTo(58, 20);
        ctx.stroke();

        // Outer glow stroke
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crystal sparkle stars
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(39, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(14, 18, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(64, 18, 2.5, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }

    // 7. Lord Mega-FUD Boss Sprite
    if (!this.textures.exists("lord_megafud_boss")) {
      const canvas = this.textures.createCanvas("lord_megafud_boss", 64, 64);
      if (canvas) {
        const ctx = canvas.context;
        // Dark crimson body
        const grad = ctx.createRadialGradient(32, 32, 8, 32, 32, 30);
        grad.addColorStop(0, "#dc2626");
        grad.addColorStop(0.7, "#7f1d1d");
        grad.addColorStop(1, "#450a0a");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 34, 24, 0, Math.PI * 2);
        ctx.fill();

        // Glitch Horns
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(14, 20);
        ctx.lineTo(6, 4);
        ctx.lineTo(24, 14);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(58, 4);
        ctx.lineTo(40, 14);
        ctx.closePath();
        ctx.fill();

        // Glowing red dragon eyes
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(22, 28, 4.5, 0, Math.PI * 2);
        ctx.arc(42, 28, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(22, 28, 2.5, 0, Math.PI * 2);
        ctx.arc(42, 28, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Sharp fangs
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(22, 42);
        ctx.lineTo(26, 50);
        ctx.lineTo(30, 42);
        ctx.moveTo(34, 42);
        ctx.lineTo(38, 50);
        ctx.lineTo(42, 42);
        ctx.closePath();
        ctx.fill();

        canvas.refresh();
      }
    }

    // 8. FUD Laser Bolt
    if (!this.textures.exists("fud_laser")) {
      const canvas = this.textures.createCanvas("fud_laser", 12, 28);
      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(2, 2, 8, 24);
        ctx.fillStyle = "#fecaca";
        ctx.fillRect(4, 4, 4, 20);
        canvas.refresh();
      }
    }

    // 9. Photon Spit Projectile
    if (!this.textures.exists("photon_spit")) {
      const canvas = this.textures.createCanvas("photon_spit", 16, 16);
      if (canvas) {
        const ctx = canvas.context;
        const grad = ctx.createRadialGradient(8, 8, 2, 8, 8, 8);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.5, "#14f195");
        grad.addColorStop(1, "rgba(20, 241, 149, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(8, 8, 7, 0, Math.PI * 2);
        ctx.fill();
        canvas.refresh();
      }
    }

    // 10. Winged Heart Life Candy (Special 2-Minute Playtime Drop)
    if (!this.textures.exists("winged_heart_candy")) {
      const canvas = this.textures.createCanvas("winged_heart_candy", 56, 44);
      if (canvas) {
        const ctx = canvas.context;
        // Golden glowing halo
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(28, 7, 12, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Left white angel wing
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(18, 22);
        ctx.quadraticCurveTo(6, 12, 2, 8);
        ctx.quadraticCurveTo(2, 22, 12, 28);
        ctx.quadraticCurveTo(4, 32, 16, 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right white angel wing
        ctx.beginPath();
        ctx.moveTo(38, 22);
        ctx.quadraticCurveTo(50, 12, 54, 8);
        ctx.quadraticCurveTo(54, 22, 44, 28);
        ctx.quadraticCurveTo(52, 32, 40, 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shiny Ruby Heart Core
        const grad = ctx.createRadialGradient(28, 24, 3, 28, 24, 16);
        grad.addColorStop(0, "#ff4b72");
        grad.addColorStop(0.7, "#f43f5e");
        grad.addColorStop(1, "#be123c");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(28, 38);
        ctx.bezierCurveTo(20, 30, 14, 24, 14, 18);
        ctx.bezierCurveTo(14, 11, 20, 10, 24, 13);
        ctx.bezierCurveTo(26, 15, 28, 18, 28, 18);
        ctx.bezierCurveTo(28, 18, 30, 15, 32, 13);
        ctx.bezierCurveTo(36, 10, 42, 11, 42, 18);
        ctx.bezierCurveTo(42, 24, 36, 30, 28, 38);
        ctx.closePath();
        ctx.fill();

        // Specular highlight shine
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(22, 16, 2.5, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }

    // 11. Nomster Playful Tongue Sprite
    if (!this.textures.exists("nomster_tongue")) {
      const canvas = this.textures.createCanvas("nomster_tongue", 24, 28);
      if (canvas) {
        const ctx = canvas.context;
        // Tongue body (soft rounded cartoon tongue)
        ctx.fillStyle = "#ff6b8b";
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(20, 4);
        ctx.quadraticCurveTo(22, 22, 12, 26);
        ctx.quadraticCurveTo(2, 22, 4, 4);
        ctx.closePath();
        ctx.fill();

        // Midline crease
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, 6);
        ctx.lineTo(12, 21);
        ctx.stroke();

        // Gloss highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.ellipse(8, 11, 2.5, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }

    // 12. Mega Chonky Gummy Bear (+5 Candy Treat)
    if (!this.textures.exists("mega_chonky_gummy")) {
      const canvas = this.textures.createCanvas("mega_chonky_gummy", 58, 58);
      if (canvas) {
        const ctx = canvas.context;
        const grad = ctx.createRadialGradient(29, 29, 5, 29, 29, 28);
        grad.addColorStop(0, "#fef08a");
        grad.addColorStop(0.4, "#f59e0b");
        grad.addColorStop(1, "#d97706");
        ctx.fillStyle = grad;

        // Left ear
        ctx.beginPath();
        ctx.arc(17, 14, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(17, 14, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Right ear
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(41, 14, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(41, 14, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Chubby Head
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(29, 24, 17, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chubby Round Belly
        ctx.beginPath();
        ctx.ellipse(29, 41, 21, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute smiling face
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.arc(23, 23, 2.5, 0, Math.PI * 2);
        ctx.arc(35, 23, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Little nose
        ctx.beginPath();
        ctx.arc(29, 27, 2, 0, Math.PI * 2);
        ctx.fill();

        // Specular jelly shine curves
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.ellipse(22, 18, 4, 2, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(24, 36, 5, 2.5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }

    // 13. Bouncy Marshmallow Corner Trampoline Pad
    if (!this.textures.exists("marshmallow_pad")) {
      const canvas = this.textures.createCanvas("marshmallow_pad", 64, 32);
      if (canvas) {
        const ctx = canvas.context;
        const grad = ctx.createLinearGradient(0, 4, 0, 30);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.6, "#fce7f3");
        grad.addColorStop(1, "#f472b6");
        ctx.fillStyle = grad;

        ctx.beginPath();
        this.drawRoundRect(ctx, 4, 4, 56, 24, 12);
        ctx.fill();

        // Spring rim outline
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Happy closed-eye smile (^ _ ^)
        ctx.strokeStyle = "#9d174d";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(24, 15, 3.5, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(40, 15, 3.5, Math.PI, 0);
        ctx.stroke();

        // Rosy pink blush cheeks
        ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
        ctx.beginPath();
        ctx.ellipse(17, 18, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(47, 18, 3.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }

    // 14. Iridescent Soap Bubble
    if (!this.textures.exists("soap_bubble")) {
      const canvas = this.textures.createCanvas("soap_bubble", 48, 48);
      if (canvas) {
        const ctx = canvas.context;
        const grad = ctx.createRadialGradient(22, 20, 4, 24, 24, 23);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        grad.addColorStop(0.7, "rgba(56, 189, 248, 0.25)");
        grad.addColorStop(0.9, "rgba(236, 72, 153, 0.4)");
        grad.addColorStop(1, "rgba(168, 85, 247, 0.65)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(24, 24, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(168, 85, 247, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Specular crescent shine highlight
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(24, 24, 17, -Math.PI * 0.75, -Math.PI * 0.35);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(33, 33, 1.8, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }

    // 15. Procedural Cartoon Cloud
    if (!this.textures.exists("cloud_puff")) {
      const canvas = this.textures.createCanvas("cloud_puff", 96, 44);
      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.beginPath();
        ctx.arc(28, 28, 14, 0, Math.PI * 2);
        ctx.arc(48, 20, 18, 0, Math.PI * 2);
        ctx.arc(68, 26, 14, 0, Math.PI * 2);
        this.drawRoundRect(ctx, 16, 26, 64, 14, 7);
        ctx.fill();
        canvas.refresh();
      }
    }

    // 16. Giant Celestial Solana Moon Orb (Stage 2)
    if (!this.textures.exists("celestial_moon")) {
      const canvas = this.textures.createCanvas("celestial_moon", 90, 90);
      if (canvas) {
        const ctx = canvas.context;
        const grad = ctx.createRadialGradient(40, 38, 8, 45, 45, 42);
        grad.addColorStop(0, "#f3e8ff");
        grad.addColorStop(0.5, "#c084fc");
        grad.addColorStop(0.85, "#7e22ce");
        grad.addColorStop(1, "rgba(88, 28, 135, 0.95)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(45, 45, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(107, 33, 168, 0.35)";
        ctx.beginPath();
        ctx.arc(32, 30, 8, 0, Math.PI * 2);
        ctx.arc(58, 42, 11, 0, Math.PI * 2);
        ctx.arc(38, 60, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(192, 132, 252, 0.6)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(45, 45, 41, 0, Math.PI * 2);
        ctx.stroke();

        canvas.refresh();
      }
    }

    // 17. Cyberpunk Skyline Silhouette (Stage 3)
    if (!this.textures.exists("cyber_skyline")) {
      const canvas = this.textures.createCanvas("cyber_skyline", 180, 65);
      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(8, 20, 26, 45);
        ctx.fillRect(36, 10, 32, 55);
        ctx.fillRect(72, 28, 24, 37);
        ctx.fillRect(98, 4, 34, 61);
        ctx.fillRect(134, 18, 38, 47);

        ctx.fillStyle = "rgba(20, 241, 149, 0.65)";
        for (let y = 16; y < 60; y += 8) {
          ctx.fillRect(42, y, 4, 4);
          ctx.fillRect(52, y, 4, 4);
          ctx.fillRect(104, y, 4, 4);
          ctx.fillRect(116, y, 4, 4);
        }
        ctx.fillStyle = "rgba(239, 68, 68, 0.65)";
        for (let y = 26; y < 60; y += 8) {
          ctx.fillRect(14, y, 4, 4);
          ctx.fillRect(78, y, 4, 4);
          ctx.fillRect(144, y, 4, 4);
          ctx.fillRect(156, y, 4, 4);
        }

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(52, 6, 2, 0, Math.PI * 2);
        ctx.arc(115, 2, 2, 0, Math.PI * 2);
        ctx.fill();

        canvas.refresh();
      }
    }
  }

  // Live Skin Setter called from React SkinSelector
  public setSkin(skin: SkinId): void {
    this.currentSkin = skin;
    this.updateAccessoryVisual();
  }

  private updateAccessoryVisual(): void {
    if (!this.accessorySprite) return;

    if (this.currentSkin === "default") {
      this.accessorySprite.setVisible(false);
    } else {
      const textureKey = `skin_${this.currentSkin}`;
      if (this.textures.exists(textureKey)) {
        this.accessorySprite.setTexture(textureKey);
        this.accessorySprite.setVisible(true);
      }
    }
  }

  private getSkinOffset(skin: SkinId): { x: number; y: number } {
    switch (skin) {
      case "shades":
        return { x: 0, y: -68 };
      case "cap":
        return { x: 0, y: -94 };
      case "crown":
        return { x: 0, y: -98 };
      case "horns":
        return { x: 0, y: -96 };
      case "diamond":
        return { x: 0, y: -98 };
      default:
        return { x: 0, y: 0 };
    }
  }

  // Mobile Paddle waddle handlers
  public waddleLeft(): void {
    if (!this.nomster || this.lives <= 0) return;
    this.waddleNomsterTo(this.nomster.x - 75);
  }

  public waddleRight(): void {
    if (!this.nomster || this.lives <= 0) return;
    this.waddleNomsterTo(this.nomster.x + 75);
  }

  private setupInteractivity(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.wakeNomster();
      if (this.lives <= 0) return;

      if (!this.isGameStarted || this.playState === "idle") {
        this.startGame();
        return;
      }

      this.pointerDownTime = this.time.now;
      this.pointerDownPos = { x: pointer.x, y: pointer.y };

      // Check if clicking/tapping Winged Life Candy directly
      if (this.wingedLifeCandy && this.wingedLifeCandy.active) {
        const distToWingedHeart = Phaser.Math.Distance.Between(
          pointer.x,
          pointer.y,
          this.wingedLifeCandy.x,
          this.wingedLifeCandy.y
        );
        if (distToWingedHeart < 52) {
          this.handleEatWingedHeart();
          return;
        }
      }

      if (this.playState !== "playing") {
        // While counting down or respawning, let player position Nomster
        this.waddleNomsterTo(pointer.x);
        return;
      }

      const distToCandy =
        this.candy && this.candy.active
          ? Phaser.Math.Distance.Between(pointer.x, pointer.y, this.candy.x, this.candy.y)
          : 999;
      const distToNomster = this.nomster
        ? Phaser.Math.Distance.Between(pointer.x, pointer.y, this.nomster.x, this.nomster.y)
        : 999;

      // Mascot Petting / Tickling interaction (toddler friendly joy)
      if (this.nomster && distToNomster < 52) {
        this.petNomster();
        this.isMovingNomster = true;
        this.waddleNomsterTo(pointer.x);
        return;
      }

      if (distToCandy < 65) {
        this.isDraggingCandy = true;
      } else if (this.nomster && (distToNomster < 80 || pointer.y > this.nomster.y - 60)) {
        this.isMovingNomster = true;
        this.waddleNomsterTo(pointer.x);
      } else {
        this.nudgeCandyTowardsNomster(pointer.x, pointer.y);
      }
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.wakeNomster();
      if (this.lives <= 0) return;

      if (this.isMovingNomster) {
        this.waddleNomsterTo(pointer.x);
      }

      if (this.isDraggingCandy && this.aimGraphics && this.candy && this.candy.active) {
        this.aimGraphics.clear();
        this.aimGraphics.lineStyle(2, 0x14f195, 0.85);
        this.aimGraphics.lineBetween(this.candy.x, this.candy.y, pointer.x, pointer.y);

        const pullX = this.candy.x - pointer.x;
        const pullY = this.candy.y - pointer.y;
        this.aimGraphics.lineStyle(2, 0xf59e0b, 0.7);
        this.aimGraphics.lineBetween(
          this.candy.x,
          this.candy.y,
          this.candy.x + pullX * 1.6,
          this.candy.y + pullY * 1.6
        );
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      this.isMovingNomster = false;

      if (this.aimGraphics) {
        this.aimGraphics.clear();
      }

      const tapDuration = this.time.now - this.pointerDownTime;
      const tapDistance = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.pointerDownPos.x,
        this.pointerDownPos.y
      );

      // Tap-to-Feed (Age 3+ Kids & Toddlers):
      // Quick tap on or near candy immediately swooshes candy right into Nomster's mouth!
      const isKidModeTap =
        this.toddlerMode &&
        this.candy &&
        this.candy.active &&
        !this.isEating &&
        this.playState === "playing" &&
        tapDuration < 850;

      const isNormalModeTap =
        tapDuration < 600 &&
        tapDistance < 65 &&
        this.candy &&
        this.candy.active &&
        !this.isEating &&
        this.playState === "playing" &&
        Phaser.Math.Distance.Between(pointer.x, pointer.y, this.candy.x, this.candy.y) < 180;

      if (isKidModeTap || isNormalModeTap) {
        this.isDraggingCandy = false;
        this.performTapToFeed();
        return;
      }

      if (this.isDraggingCandy && this.candy && this.candy.active) {
        this.isDraggingCandy = false;
        const pullX = (this.candy.x - pointer.x) * 4.8;
        const pullY = (this.candy.y - pointer.y) * 4.8;

        const maxSpeed = 750;
        const vx = Phaser.Math.Clamp(pullX, -maxSpeed, maxSpeed);
        const vy = Phaser.Math.Clamp(pullY, -maxSpeed, maxSpeed);

        this.candy.setVelocity(vx, vy);
        this.candy.setAngularVelocity((vx > 0 ? 1 : -1) * 220);
        sounds.playFling();
      } else {
        this.isDraggingCandy = false;
      }
    });
  }

  // Mascot Mood Wake-up handler
  public wakeNomster(): void {
    if (!this.nomster) return;
    this.lastInputTime = this.time.now;
    if (this.isNapping) {
      this.isNapping = false;
      if (this.sleepingEyes) {
        this.sleepingEyes.setVisible(false);
      }
      if (this.leftPupil) {
        this.leftPupil.setVisible(true);
      }
      if (this.rightPupil) {
        this.rightPupil.setVisible(true);
      }
      sounds.playWakeup();

      // Cheerful wake-up hop
      this.tweens.add({
        targets: this.nomster,
        scaleY: 1.18,
        scaleX: 0.88,
        duration: 110,
        yoyo: true,
        ease: "Back.easeOut",
        onComplete: () => {
          this.updateNomsterMood();
        },
      });

      // Cheerful exclamation "!?" text
      const wakeTxt = this.add.text(this.nomster.x, this.nomster.y - 80, "✨ !? ✨", {
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#14f195",
        stroke: "#000000",
        strokeThickness: 3,
      });
      wakeTxt.setOrigin(0.5);
      wakeTxt.setDepth(26);
      this.tweens.add({
        targets: wakeTxt,
        y: wakeTxt.y - 35,
        alpha: 0,
        scale: 1.3,
        duration: 600,
        ease: "Cubic.easeOut",
        onComplete: () => wakeTxt.destroy(),
      });
    }
  }

  // Marshmallow Trampoline Bounce (Second Chance Save)
  private handleTrampolineBounce(pad: Phaser.GameObjects.Sprite, isLeft: boolean): void {
    if (!this.candy || !this.candy.active || this.isEating || this.lives <= 0) return;

    // Prevent rapid multiple bounces in the same frame
    const currentVy = this.candy.body?.velocity.y || 0;
    if (currentVy < 0) return; // already traveling upwards

    sounds.playBoing();

    // Elastic squish tween on pad
    this.tweens.killTweensOf(pad);
    this.tweens.add({
      targets: pad,
      scaleY: 0.55,
      scaleX: 1.35,
      duration: 100,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => {
        pad.setScale(1.0);
      },
    });

    // Launch candy upward and inward towards center
    const vx = isLeft ? Phaser.Math.Between(140, 220) : Phaser.Math.Between(-220, -140);
    const vy = Phaser.Math.Between(-540, -480);
    this.candy.setVelocity(vx, vy);
    this.candy.setAngularVelocity(isLeft ? 280 : -280);

    // Marshmallow bounce sparks
    const colors = [0xf472b6, 0xfce7f3, 0xffffff, 0xfb7185];
    for (let i = 0; i < 8; i++) {
      const spark = this.add.circle(
        pad.x + Phaser.Math.Between(-15, 15),
        pad.y - 12,
        Phaser.Math.Between(2, 4),
        Phaser.Utils.Array.GetRandom(colors)
      );
      spark.setDepth(12);
      this.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-30, 30),
        y: spark.y - Phaser.Math.Between(20, 50),
        alpha: 0,
        scale: 0.2,
        duration: 400,
        onComplete: () => spark.destroy(),
      });
    }

    // Floating celebratory "BOING! SAVED!" text
    const boingText = this.add.text(pad.x, pad.y - 32, "🌸 BOING! SAVED! 🌸", {
      fontFamily: "monospace",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#f472b6",
      stroke: "#000000",
      strokeThickness: 3,
    });
    boingText.setOrigin(0.5);
    boingText.setDepth(25);
    this.tweens.add({
      targets: boingText,
      y: boingText.y - 45,
      alpha: 0,
      scale: 1.2,
      duration: 750,
      ease: "Back.easeOut",
      onComplete: () => boingText.destroy(),
    });
  }

  // Tap-to-Feed: Smoothly swooshes candy into Nomster's mouth with rainbow sparkles
  private performTapToFeed(): void {
    if (!this.candy || !this.candy.active || this.isEating) return;

    sounds.playTongueSlurp();
    this.createEatSparks(this.candy.x, this.candy.y);

    if (this.candy.body) {
      this.candy.setVelocity(0, 0);
      (this.candy.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    }

    this.tweens.add({
      targets: this.candy,
      x: this.mouthCollider.x,
      y: this.mouthCollider.y,
      scale: 0.25,
      duration: 260,
      ease: "Quad.easeInOut",
      onComplete: () => {
        this.handleEatCandy();
      },
    });
  }

  // Mascot Petting / Tickle: Joyful giggle, squish bounce, and heart emojis
  public petNomster(): void {
    if (!this.nomster) return;
    sounds.playGiggle();

    // Squish & bounce
    this.tweens.killTweensOf(this.nomster);
    this.tweens.add({
      targets: this.nomster,
      scaleX: 1.25,
      scaleY: 0.82,
      duration: 100,
      yoyo: true,
      repeat: 1,
      ease: "Back.easeOut",
      onComplete: () => {
        this.updateNomsterMood();
      },
    });

    // Float joyful hearts & giggles
    const petEmojis = ["💖", "🥰", "✨", "💕", "🐾"];
    for (let i = 0; i < 3; i++) {
      const emoji = Phaser.Utils.Array.GetRandom(petEmojis);
      const heartTxt = this.add.text(
        this.nomster.x + Phaser.Math.Between(-28, 28),
        this.nomster.y - 75 + Phaser.Math.Between(-10, 10),
        emoji,
        {
          fontSize: "20px",
        }
      );
      heartTxt.setOrigin(0.5);
      heartTxt.setDepth(30);

      this.tweens.add({
        targets: heartTxt,
        y: heartTxt.y - Phaser.Math.Between(45, 75),
        x: heartTxt.x + Phaser.Math.Between(-20, 20),
        alpha: 0,
        scale: 1.3,
        duration: 800 + i * 140,
        ease: "Cubic.easeOut",
        onComplete: () => heartTxt.destroy(),
      });
    }
  }

  private waddleNomsterTo(targetX: number): void {
    if (!this.nomster) return;
    const { width } = this.cameras.main;
    const clampedX = Phaser.Math.Clamp(targetX, 60, width - 60);
    const diff = clampedX - this.nomster.x;
    const tilt = Phaser.Math.Clamp(diff * 0.08, -8, 8);

    this.tweens.add({
      targets: [this.nomster],
      x: clampedX,
      angle: tilt,
      duration: 120,
      ease: "Power1",
      onComplete: () => {
        if (!this.nomster) return;
        this.tweens.add({
          targets: this.nomster,
          angle: 0,
          duration: 100,
        });
      },
    });
  }

  private nudgeCandyTowardsNomster(pointerX: number, pointerY: number): void {
    if (!this.candy || this.isEating || this.lives <= 0) return;

    const angle = Phaser.Math.Angle.Between(pointerX, pointerY, this.candy.x, this.candy.y);
    const impulse = 380;
    const vx = Math.cos(angle) * impulse;
    const vy = Math.min(Math.sin(angle) * impulse, -200);

    this.candy.setVelocity(vx, vy);
    this.candy.setAngularVelocity(vx > 0 ? 260 : -260);
    sounds.playFling();

    const ripple = this.add.circle(pointerX, pointerY, 6, 0x14f195, 0.8);
    this.tweens.add({
      targets: ripple,
      radius: 35,
      alpha: 0,
      duration: 300,
      ease: "Quad.easeOut",
      onComplete: () => ripple.destroy(),
    });
  }

  private spawnFUDHazard(): void {
    const { width, height } = this.cameras.main;
    const hazardY = height * 0.42;

    const hazardCanvas = this.textures.createCanvas("fud_hazard", 36, 36);
    if (hazardCanvas) {
      const ctx = hazardCanvas.context;
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? 16 : 8;
        const a = (i * Math.PI) / 4;
        const x = 18 + r * Math.cos(a);
        const y = 18 + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#FCA5A5";
      ctx.lineWidth = 2;
      ctx.stroke();
      hazardCanvas.refresh();
    }

    this.fudHazard = this.physics.add.sprite(50, hazardY, "fud_hazard");
    this.fudHazard.setCircle(14, 4, 4);
    this.fudHazard.setImmovable(true);
    (this.fudHazard.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

    this.tweens.add({
      targets: this.fudHazard,
      x: width - 50,
      duration: 2800,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.fudHazard,
      angle: 360,
      duration: 3500,
      repeat: -1,
    });
  }

  // Pre-instantiates the candy physics sprite in inactive state until game start
  private initCandySprite(): void {
    const { width } = this.cameras.main;
    this.candy = this.physics.add.sprite(width / 2, -100, "candy");
    this.candy.setCollideWorldBounds(true);
    this.candy.setBounce(0.65, 0.65);
    this.candy.setGravityY(460);
    this.candy.setDrag(15, 10);
    this.candy.setCircle(20, 2, 2);
    this.candy.disableBody(true, true);
  }

  // Displays an interactive start prompt on canvas before game starts
  private showStartPrompt(): void {
    // If external UI manages start state, do not paint duplicate canvas elements
    if (this.callbacks.onGameStateChange) {
      return;
    }

    const { width, height } = this.cameras.main;
    const container = this.add.container(width / 2, height * 0.38);
    this.startPromptContainer = container;

    // Glowing badge background
    const bg = this.add.rectangle(0, 0, 270, 115, 0x070d1a, 0.92);
    bg.setStrokeStyle(2, 0x14f195, 0.7);
    container.add(bg);

    const title = this.add.text(0, -28, "READY TO PLAY?", {
      fontFamily: "monospace",
      fontSize: "17px",
      fontStyle: "bold",
      color: "#14F195",
      stroke: "#04070D",
      strokeThickness: 3,
    });
    title.setOrigin(0.5);
    container.add(title);

    const btn = this.add.text(0, 6, "▶ TAP TO START", {
      fontFamily: "monospace",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#030712",
      backgroundColor: "#14f195",
      padding: { x: 16, y: 7 },
    });
    btn.setOrigin(0.5);
    btn.setInteractive({ cursor: "pointer" });
    btn.on("pointerdown", () => {
      this.startGame();
    });
    container.add(btn);

    const subtitle = this.add.text(0, 38, "5 Lives • Drag or Tap Nomster & Candies!", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#94a3b8",
    });
    subtitle.setOrigin(0.5);
    container.add(subtitle);

    // Gentle float tween
    this.tweens.add({
      targets: container,
      y: height * 0.38 - 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  // Initiates 3-2-1 arcade countdown and launches the game
  public startGame(): void {
    if (this.playState === "playing" || this.playState === "countdown") return;

    if (this.startPromptContainer) {
      this.startPromptContainer.destroy();
      this.startPromptContainer = undefined;
    }

    this.startCountdown("start", () => {
      const { width } = this.cameras.main;
      this.spawnCandy(width / 2, 45);
    });
  }

  // Unified Countdown Engine (Pre-game & Between lives grace period)
  private startCountdown(
    reason: "start" | "respawn",
    onComplete: () => void
  ): void {
    this.playState = reason === "start" ? "countdown" : "respawning";
    if (this.callbacks.onGameStateChange) {
      this.callbacks.onGameStateChange(this.playState);
    }

    const { width, height } = this.cameras.main;

    // Smoothly re-center Nomster
    this.waddleNomsterTo(width / 2);

    if (this.countdownContainer) {
      this.countdownContainer.destroy();
      this.countdownContainer = undefined;
    }
    if (this.countdownTimer) {
      this.countdownTimer.remove();
      this.countdownTimer = undefined;
    }

    const container = this.add.container(width / 2, height * 0.38);
    this.countdownContainer = container;

    // Background pill badge
    const bgPill = this.add.rectangle(0, 0, 250, 110, 0x050914, 0.92);
    bgPill.setStrokeStyle(2, reason === "start" ? 0x14f195 : 0xef4444, 0.7);
    container.add(bgPill);

    const subtext = this.add.text(
      0,
      -30,
      reason === "start" ? "READY TO PLAY" : `LIFE LOST! (${this.lives} ❤️ LEFT)`,
      {
        fontFamily: "monospace",
        fontSize: "13px",
        fontStyle: "bold",
        color: reason === "start" ? "#14F195" : "#EF4444",
        stroke: "#04070D",
        strokeThickness: 3,
        align: "center",
      }
    );
    subtext.setOrigin(0.5);
    container.add(subtext);

    const countText = this.add.text(0, 15, "3", {
      fontFamily: "monospace",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#F59E0B",
      stroke: "#04070D",
      strokeThickness: 6,
      align: "center",
    });
    countText.setOrigin(0.5);
    container.add(countText);

    let count = 3;
    sounds.playCountdownTick();

    this.tweens.add({
      targets: countText,
      scaleX: { from: 1.5, to: 1.0 },
      scaleY: { from: 1.5, to: 1.0 },
      duration: 300,
      ease: "Back.easeOut",
    });

    this.countdownTimer = this.time.addEvent({
      delay: 750,
      repeat: 3,
      callback: () => {
        count--;
        if (count === 2) {
          countText.setText("2");
          countText.setColor("#9945FF");
          sounds.playCountdownTick();
          this.tweens.add({
            targets: countText,
            scaleX: { from: 1.5, to: 1.0 },
            scaleY: { from: 1.5, to: 1.0 },
            duration: 300,
            ease: "Back.easeOut",
          });
        } else if (count === 1) {
          countText.setText("1");
          countText.setColor("#14F195");
          sounds.playCountdownTick();
          this.tweens.add({
            targets: countText,
            scaleX: { from: 1.5, to: 1.0 },
            scaleY: { from: 1.5, to: 1.0 },
            duration: 300,
            ease: "Back.easeOut",
          });
        } else if (count === 0) {
          countText.setText("GO!");
          countText.setColor("#14F195");
          subtext.setText("CATCH THE CANDY!");
          subtext.setColor("#F59E0B");
          sounds.playCountdownGo();
          this.tweens.add({
            targets: countText,
            scaleX: { from: 1.7, to: 1.0 },
            scaleY: { from: 1.7, to: 1.0 },
            duration: 300,
            ease: "Back.easeOut",
          });
        } else {
          // Finished countdown
          if (this.countdownContainer) {
            this.countdownContainer.destroy();
            this.countdownContainer = undefined;
          }
          this.playState = "playing";
          this.isGameStarted = true;
          if (this.callbacks.onGameStateChange) {
            this.callbacks.onGameStateChange("playing");
          }
          onComplete();
        }
      },
    });
  }

  // Returns current physics gravity based on dynamic stage
  private getStageGravity(): number {
    if (this.toddlerMode) return 170;
    if (this.currentStageId === "moon") return 190;
    if (this.currentStageId === "matrix") return 360;
    if (this.currentStageId === "hyperdrive") return 340;
    return 260;
  }

  // Dynamic stage shifting engine (Updates background colors, grid, and gravity)
  private updateStageEnvironment(stageId: string): void {
    if (!this.bgGraphics || !this.gridGraphics) return;
    const { width, height } = this.cameras.main;
    this.currentStageId = stageId;

    let topColor = 0x0a101f;
    let bottomColor = 0x04070d;
    let gridColor = 0x18243b;

    if (stageId === "moon") {
      topColor = 0x140b2b;
      bottomColor = 0x060212;
      gridColor = 0x3b185f;
    } else if (stageId === "matrix") {
      topColor = 0x1f070a;
      bottomColor = 0x0a0103;
      gridColor = 0x5f1824;
    } else if (stageId === "hyperdrive") {
      topColor = 0x241800;
      bottomColor = 0x080500;
      gridColor = 0x5f4a18;
    }

    this.bgGraphics.clear();
    this.bgGraphics.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
    this.bgGraphics.fillRect(0, 0, width, height);

    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, gridColor, 0.4);
    for (let x = 0; x < width; x += 36) {
      this.gridGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 36) {
      this.gridGraphics.lineBetween(0, y, width, y);
    }

    // Dynamic Starfield color per stage
    let starColor = 0x14f195;
    if (stageId === "moon") {
      starColor = 0x9945ff;
    } else if (stageId === "matrix") {
      starColor = 0xef4444;
    } else if (stageId === "hyperdrive") {
      starColor = 0xf59e0b;
    }

    if (this.stars && this.stars.length > 0) {
      for (const star of this.stars) {
        star.circle.setFillStyle(starColor, star.circle.alpha);
      }
    }

    // Dynamic Stage Scenery Management
    if (this.sceneryGraphics) {
      this.sceneryGraphics.clear();
    }

    if (stageId === "meadow") {
      this.clouds.forEach((c) => c.sprite.setVisible(true));
      this.fireflies.forEach((f) => f.arc.setVisible(true));
      if (this.celestialMoon) this.celestialMoon.setVisible(false);
      if (this.cyberSkyline) this.cyberSkyline.setVisible(false);
      this.warpLines.forEach((w) => w.line.setVisible(false));

      // Rolling Cyber Green Candle Meadow Hills
      if (this.sceneryGraphics) {
        this.sceneryGraphics.fillStyle(0x064e3b, 0.4);
        this.sceneryGraphics.beginPath();
        this.sceneryGraphics.moveTo(0, height - 70);
        for (let x = 0; x <= width; x += 16) {
          const y = (height - 75) + Math.sin((x / width) * Math.PI * 2) * 18;
          this.sceneryGraphics.lineTo(x, y);
        }
        this.sceneryGraphics.lineTo(width, height);
        this.sceneryGraphics.lineTo(0, height);
        this.sceneryGraphics.closePath();
        this.sceneryGraphics.fill();

        this.sceneryGraphics.lineStyle(1.5, 0x14f195, 0.45);
        this.sceneryGraphics.beginPath();
        this.sceneryGraphics.moveTo(0, height - 70);
        for (let x = 0; x <= width; x += 16) {
          const y = (height - 75) + Math.sin((x / width) * Math.PI * 2) * 18;
          this.sceneryGraphics.lineTo(x, y);
        }
        this.sceneryGraphics.stroke();
      }
    } else if (stageId === "moon") {
      this.clouds.forEach((c) => c.sprite.setVisible(false));
      this.fireflies.forEach((f) => f.arc.setVisible(false));
      if (this.celestialMoon) {
        this.celestialMoon.setVisible(true);
      }
      if (this.cyberSkyline) this.cyberSkyline.setVisible(false);
      this.warpLines.forEach((w) => w.line.setVisible(false));

      // Lunar horizon
      if (this.sceneryGraphics) {
        this.sceneryGraphics.fillStyle(0x2e1065, 0.45);
        this.sceneryGraphics.beginPath();
        this.sceneryGraphics.moveTo(0, height - 60);
        for (let x = 0; x <= width; x += 16) {
          const y = (height - 70) + Math.sin((x / width) * Math.PI) * -24;
          this.sceneryGraphics.lineTo(x, y);
        }
        this.sceneryGraphics.lineTo(width, height);
        this.sceneryGraphics.lineTo(0, height);
        this.sceneryGraphics.closePath();
        this.sceneryGraphics.fill();
      }
    } else if (stageId === "matrix") {
      this.clouds.forEach((c) => c.sprite.setVisible(false));
      this.fireflies.forEach((f) => f.arc.setVisible(false));
      if (this.celestialMoon) this.celestialMoon.setVisible(false);
      if (this.cyberSkyline) this.cyberSkyline.setVisible(true);
      this.warpLines.forEach((w) => w.line.setVisible(false));
    } else if (stageId === "hyperdrive") {
      this.clouds.forEach((c) => c.sprite.setVisible(false));
      this.fireflies.forEach((f) => f.arc.setVisible(false));
      if (this.celestialMoon) this.celestialMoon.setVisible(false);
      if (this.cyberSkyline) this.cyberSkyline.setVisible(false);
      this.warpLines.forEach((w) => w.line.setVisible(true));
    }

    if (this.candy && this.candy.active) {
      this.candy.setGravityY(this.activePowerUps.slowmo ? 180 : this.getStageGravity());
    }
  }

  // Evaluates score thresholds and triggers dynamic stage transformations
  private checkStageProgression(currentScore: number): void {
    if (currentScore === 10 && this.currentStageId !== "moon") {
      this.triggerLevelUp("moon", "🌙 STAGE 02: MOON ORBIT ZERO-G!");
    } else if (currentScore === 25 && this.currentStageId !== "matrix") {
      this.triggerLevelUp("matrix", "⚡ STAGE 03: GLITCH CYBERSTORM!");
    } else if (currentScore === 50 && this.currentStageId !== "hyperdrive") {
      this.triggerLevelUp("hyperdrive", "👑 STAGE 04: SOLANA HYPER-DRIVE!");
    }
  }

  // Level Up announcement and celebratory banner
  private triggerLevelUp(stageId: string, bannerText: string): void {
    this.updateStageEnvironment(stageId);
    sounds.playPowerUpCollect();

    const { width } = this.cameras.main;
    const banner = this.add.text(width / 2, 130, bannerText, {
      fontFamily: "monospace",
      fontSize: "15px",
      fontStyle: "bold",
      color: stageId === "moon" ? "#9945FF" : stageId === "matrix" ? "#EF4444" : "#F59E0B",
      backgroundColor: "#050914F0",
      padding: { x: 14, y: 7 },
      stroke: "#000000",
      strokeThickness: 4,
    });
    banner.setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      scaleX: { from: 0.5, to: 1.15 },
      scaleY: { from: 0.5, to: 1.15 },
      y: 90,
      alpha: { from: 1, to: 0 },
      duration: 1800,
      ease: "Back.easeOut",
      onComplete: () => banner.destroy(),
    });
  }

  // Spawns floating combat damage text synced with the World Raid Boss
  private showRaidDamageFloat(x: number, y: number, streak: number): void {
    const isCrit = streak >= 3;
    const baseMult = this.holderTierPerks?.raidMultiplier || 1;
    const dmg = (isCrit ? 2 : 1) * baseMult;
    const text = isCrit
      ? `-${dmg} CRIT! 💥${baseMult > 1 ? " (WHALE 2X)" : ` (x${streak})`}`
      : `-${dmg} RAID DMG ⚔️${baseMult > 1 ? " (WHALE 2X)" : ""}`;

    const floatText = this.add.text(x, y - 10, text, {
      fontFamily: "monospace",
      fontSize: isCrit ? "14px" : "12px",
      fontStyle: "bold",
      color: isCrit ? "#F59E0B" : baseMult > 1 ? "#38BDF8" : "#14F195",
      stroke: "#000000",
      strokeThickness: 3,
    });
    floatText.setOrigin(0.5);

    this.tweens.add({
      targets: floatText,
      y: y - 55,
      alpha: 0,
      scaleX: isCrit ? 1.3 : 1.1,
      scaleY: isCrit ? 1.3 : 1.1,
      duration: 750,
      ease: "Quad.easeOut",
      onComplete: () => floatText.destroy(),
    });
  }

  // Renders persistent target badge at top of canvas when a rival challenge is active
  private renderRivalBanner(): void {
    if (!this.rival) return;
    const { width } = this.cameras.main;
    if (this.rivalBadge) {
      this.rivalBadge.destroy();
    }

    const container = this.add.container(width / 2, 28);
    this.rivalBadge = container;

    const bg = this.add.rectangle(0, 0, 260, 28, 0x050914, 0.88);
    bg.setStrokeStyle(1.5, 0xf59e0b, 0.85);
    container.add(bg);

    const text = this.add.text(
      0,
      0,
      `🎯 RIVAL: Beat ${this.rival.challenger} (${this.rival.score} pts)`,
      {
        fontFamily: "monospace",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#F59E0B",
      }
    );
    text.setOrigin(0.5);
    container.add(text);
  }

  // Celebratory announcement and audio fanfare when rival is dethroned
  private triggerRivalDethroned(): void {
    sounds.playFrenzy();
    const { width } = this.cameras.main;

    const banner = this.add.text(
      width / 2,
      130,
      `👑 RIVAL DETHRONED!\nYou beat ${this.rival?.challenger} (${this.rival?.score} pts)!`,
      {
        fontFamily: "monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#F59E0B",
        backgroundColor: "#050914FA",
        padding: { x: 16, y: 8 },
        stroke: "#000000",
        strokeThickness: 5,
        align: "center",
      }
    );
    banner.setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      scaleX: { from: 0.6, to: 1.2 },
      scaleY: { from: 0.6, to: 1.2 },
      alpha: { from: 1, to: 0 },
      y: 90,
      duration: 2500,
      ease: "Back.easeOut",
      onComplete: () => banner.destroy(),
    });

    if (this.callbacks.onRivalDethroned && this.rival) {
      this.callbacks.onRivalDethroned(this.score, this.rival.challenger);
    }
  }

  // Public trigger for Whale Buy Golden Candy Frenzy event
  public triggerGoldenFrenzy(durationSec: number = 20): void {
    this.isFrenzy = true;
    sounds.playFrenzy();

    const { width } = this.cameras.main;
    const banner = this.add.text(
      width / 2,
      120,
      "🚨 WHALE BUY FRENZY! 2X POINTS & GOLDEN RAIN! 🚨",
      {
        fontFamily: "monospace",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#F59E0B",
        backgroundColor: "#050914FA",
        padding: { x: 14, y: 7 },
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      }
    );
    banner.setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      scale: { from: 0.7, to: 1.15 },
      alpha: { from: 1, to: 0 },
      duration: 2200,
      ease: "Back.easeOut",
      onComplete: () => banner.destroy(),
    });

    if (this.frenzyTimer) {
      this.frenzyTimer.remove();
    }
    this.frenzyTimer = this.time.delayedCall(durationSec * 1000, () => {
      this.isFrenzy = false;
      if (this.callbacks.onFrenzyEnd) {
        this.callbacks.onFrenzyEnd();
      }
    });
  }

  private spawnCandy(x: number, y: number): void {
    const { width } = this.cameras.main;
    const spawnX = x || Phaser.Math.Between(width * 0.2, width * 0.8);
    const spawnY = y || 45;

    // Reset special varieties
    this.isChonkyGummy = false;
    this.isSoapBubble = false;
    if (this.bubbleSprite) {
      this.bubbleSprite.setVisible(false);
    }

    // Roll for special power-up candy
    this.currentPowerUpType = rollForPowerUp(this.score);

    // If no power-up, roll 15% for Mega Chonky Gummy Bear and 15% for Soap Bubble Candy
    if (!this.currentPowerUpType) {
      const roll = Math.random();
      if (roll < 0.15) {
        this.isChonkyGummy = true;
      } else if (roll < 0.30) {
        this.isSoapBubble = true;
      }
    }

    let baseGravity = this.activePowerUps.slowmo ? 180 : this.getStageGravity();
    if (this.isChonkyGummy) {
      baseGravity *= 0.88; // Slightly floatier chubby gummy
    } else if (this.isSoapBubble) {
      baseGravity *= 0.68; // Very floaty soap bubble
    }

    const textureKey = this.isChonkyGummy ? "mega_chonky_gummy" : "candy";

    if (!this.candy) {
      this.candy = this.physics.add.sprite(spawnX, spawnY, textureKey);
      this.candy.setCollideWorldBounds(true);
      this.candy.setBounce(0.65, 0.65);
      this.candy.setGravityY(baseGravity);
      this.candy.setDrag(15, 10);
      this.candy.setCircle(20, 2, 2);
    } else {
      this.candy.setTexture(textureKey);
      this.candy.enableBody(true, spawnX, spawnY, true, true);
      this.candy.setScale(0);
      this.candy.setAlpha(1);
      this.candy.setGravityY(baseGravity);

      const vx = Phaser.Math.Between(-90, 90);
      this.candy.setVelocity(vx, Phaser.Math.Between(-30, 20));
      this.candy.setAngularVelocity(Phaser.Math.Between(-140, 140));

      const targetScale = this.isChonkyGummy ? 1.15 : 1.0;
      this.tweens.killTweensOf(this.candy);
      this.tweens.add({
        targets: this.candy,
        scale: targetScale,
        duration: 250,
        ease: "Back.easeOut",
        onComplete: () => {
          if (this.isChonkyGummy && this.candy && this.candy.active) {
            this.tweens.add({
              targets: this.candy,
              scaleX: 1.25,
              scaleY: 1.05,
              duration: 380,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        },
      });
    }

    // Soap Bubble visual envelope
    if (this.isSoapBubble) {
      if (!this.bubbleSprite) {
        this.bubbleSprite = this.add.sprite(spawnX, spawnY, "soap_bubble");
        this.bubbleSprite.setDepth(8);
      }
      this.bubbleSprite.setPosition(spawnX, spawnY);
      this.bubbleSprite.setVisible(true);
      this.bubbleSprite.setAlpha(0.88);
      this.tweens.add({
        targets: this.bubbleSprite,
        scale: 1.18,
        duration: 550,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Apply Power-Up or Special Candy Visual Dressing
    if (this.currentPowerUpType) {
      const pConfig = POWER_UPS[this.currentPowerUpType];
      this.candy.setTint(pConfig.hexColor);

      if (!this.candyLabel) {
        this.candyLabel = this.add.text(spawnX, spawnY - 25, pConfig.badge, {
          fontFamily: "monospace",
          fontSize: "11px",
          color: pConfig.color,
          stroke: "#000000",
          strokeThickness: 3,
        });
        this.candyLabel.setOrigin(0.5);
      } else {
        this.candyLabel.setText(pConfig.badge);
        this.candyLabel.setColor(pConfig.color);
        this.candyLabel.setVisible(true);
      }
    } else if (this.isChonkyGummy) {
      this.candy.clearTint();
      if (!this.candyLabel) {
        this.candyLabel = this.add.text(spawnX, spawnY - 25, "🐻 CHONKY! (+5)", {
          fontFamily: "monospace",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#f59e0b",
          stroke: "#000000",
          strokeThickness: 3,
        });
        this.candyLabel.setOrigin(0.5);
      } else {
        this.candyLabel.setText("🐻 CHONKY! (+5)");
        this.candyLabel.setColor("#f59e0b");
        this.candyLabel.setVisible(true);
      }
    } else if (this.isSoapBubble) {
      this.candy.clearTint();
      if (!this.candyLabel) {
        this.candyLabel = this.add.text(spawnX, spawnY - 25, "🫧 BUBBLE CANDY", {
          fontFamily: "monospace",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#38bdf8",
          stroke: "#000000",
          strokeThickness: 3,
        });
        this.candyLabel.setOrigin(0.5);
      } else {
        this.candyLabel.setText("🫧 BUBBLE CANDY");
        this.candyLabel.setColor("#38bdf8");
        this.candyLabel.setVisible(true);
      }
    } else {
      this.candy.clearTint();
      if (this.candyLabel) {
        this.candyLabel.setVisible(false);
      }
    }

    this.isEating = false;
  }

  private handleEatCandy(): void {
    if (!this.nomster || !this.mouthCollider || this.isEating || this.lives <= 0) return;
    this.isEating = true;
    this.wakeNomster();

    if (this.candyLabel) {
      this.candyLabel.setVisible(false);
    }

    // Check if candy was a special power-up
    if (this.currentPowerUpType) {
      this.activatePowerUp(this.currentPowerUpType);
    }

    let pointsEarned = 1;
    if (this.isChonkyGummy) {
      pointsEarned = 5; // +5 points for Mega Chonky Gummy!
    }

    if (this.isFeverOverdrive) {
      pointsEarned *= 3;
    } else if (this.isFrenzy) {
      pointsEarned *= 2;
    }

    if (this.airJuggleCount > 0) {
      pointsEarned = Math.round(pointsEarned * (1 + this.airJuggleCount));
      this.airJuggleCount = 0;
    }

    if (this.holderTierPerks?.scoreMultiplier && this.holderTierPerks.scoreMultiplier > 1) {
      pointsEarned = Math.max(1, Math.round(pointsEarned * this.holderTierPerks.scoreMultiplier));
    }

    this.score += pointsEarned;
    this.streak++;

    // Procedural Formant Vocal Synthesizer
    nomsterVoice.speakNomNom();

    // Duel AI Contest Scoring
    if (this.deepNomMode === "duel") {
      this.deepNomHumanScore++;
      const duelBanner = this.add.text(
        this.mouthCollider.x,
        this.mouthCollider.y - 45,
        `⚡ YOU SCORED! [YOU: ${this.score} | AI: ${this.deepNomAiScore}]`,
        {
          fontFamily: "monospace",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#14f195",
          stroke: "#000000",
          strokeThickness: 3,
        }
      );
      duelBanner.setOrigin(0.5);
      duelBanner.setDepth(34);
      this.tweens.add({
        targets: duelBanner,
        y: duelBanner.y - 40,
        scale: 1.15,
        alpha: 0,
        duration: 850,
        ease: "Back.easeOut",
        onComplete: () => duelBanner.destroy(),
      });

      if (this.callbacks.onDeepNomTelemetry) {
        this.callbacks.onDeepNomTelemetry({
          mode: "duel",
          predictedX: this.deepNomPredictedX,
          timeRemaining: 0,
          aiScore: this.deepNomAiScore,
          humanScore: this.score,
          status: "HUMAN_SCORED",
        });
      }
    }

    // Pentatonic Xylophone Music-Box Combo
    sounds.playXylophoneCombo(this.streak);

    if (this.isChonkyGummy) {
      sounds.playChonkyNom();
      // Floating banner
      const chonkyBanner = this.add.text(
        this.mouthCollider.x,
        this.mouthCollider.y - 40,
        "🐻 CHONKY NOM! +5 🐻",
        {
          fontFamily: "monospace",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#f59e0b",
          stroke: "#000000",
          strokeThickness: 3,
        }
      );
      chonkyBanner.setOrigin(0.5);
      chonkyBanner.setDepth(33);
      this.tweens.add({
        targets: chonkyBanner,
        y: chonkyBanner.y - 50,
        scale: 1.25,
        alpha: 0,
        duration: 850,
        ease: "Back.easeOut",
        onComplete: () => chonkyBanner.destroy(),
      });
    } else if (this.isSoapBubble) {
      sounds.playBubblePop();
      if (this.bubbleSprite) {
        this.bubbleSprite.setVisible(false);
      }
      // Iridescent bubble pop particles
      const bubbleColors = [0x38bdf8, 0xa855f7, 0xf472b6, 0xffffff];
      for (let i = 0; i < 10; i++) {
        const bp = this.add.circle(
          this.mouthCollider.x + Phaser.Math.Between(-10, 10),
          this.mouthCollider.y - 20 + Phaser.Math.Between(-10, 10),
          Phaser.Math.Between(3, 5),
          Phaser.Utils.Array.GetRandom(bubbleColors),
          0.8
        );
        bp.setDepth(15);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const spd = Phaser.Math.Between(40, 120);
        this.tweens.add({
          targets: bp,
          x: bp.x + Math.cos(angle) * spd,
          y: bp.y + Math.sin(angle) * spd,
          scale: 0.1,
          alpha: 0,
          duration: 350,
          onComplete: () => bp.destroy(),
        });
      }
    } else {
      sounds.playNom();
    }

    // Increment NOM-RAGE Fever Meter
    this.addFeverPoints(7);

    // Retaliate against Lord Mega-FUD if Boss fight is active
    if (this.bossContainer && !this.isBossDefeated) {
      this.firePhotonAtBoss();
    }

    // Dynamic Stage Upgrade Check (Level Up!)
    this.checkStageProgression(this.score);

    // Check if story episode objective is achieved
    if (this.currentEpisodeConfig && !this.currentEpisodeConfig.isBossEpisode) {
      if (this.score >= this.currentEpisodeConfig.targetScore) {
        this.handleEpisodeComplete();
      }
    }

    // Check if rival challenge score is exceeded
    if (this.rival && !this.rivalBeaten && this.score > this.rival.score) {
      this.rivalBeaten = true;
      this.triggerRivalDethroned();
    }

    // Floating Raid Boss Combat Text
    this.showRaidDamageFloat(this.mouthCollider.x, this.mouthCollider.y - 20, this.streak);

    if (this.streak === 10) {
      this.activateFrenzyMode();
    }

    // Victory Wiggle Dance on 10 streaks!
    if (this.streak % 10 === 0 && this.streak > 0) {
      this.tweens.add({
        targets: this.nomster,
        angle: { from: -14, to: 14 },
        scaleY: 1.15,
        duration: 90,
        yoyo: true,
        repeat: 3,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.nomster.angle = 0;
          this.updateNomsterMood();
        },
      });
    }

    if (this.isAnticipating) {
      this.isAnticipating = false;
      if (this.mouthGlow) {
        this.tweens.killTweensOf(this.mouthGlow);
        this.mouthGlow.setVisible(false);
      }
    }

    if (this.leftPupil && this.rightPupil) {
      this.tweens.add({
        targets: [this.leftPupil, this.rightPupil],
        scaleX: 1.35,
        scaleY: 1.35,
        duration: 90,
        yoyo: true,
        repeat: 1,
      });
    }

    if (this.tongueSprite && this.tongueSprite.visible) {
      sounds.playTongueSlurp();
    }

    // Floating celebratory emoji burst for toddler & 3+ kid delight!
    const catchEmojis = ["😋", "💖", "🍭", "🌟", "🌈", "✨", "🎉"];
    const chosenEmoji = Phaser.Utils.Array.GetRandom(catchEmojis);
    const emojiText = this.add.text(
      this.mouthCollider.x + Phaser.Math.Between(-15, 15),
      this.mouthCollider.y - 25,
      chosenEmoji,
      { fontSize: "22px" }
    );
    emojiText.setOrigin(0.5);
    emojiText.setDepth(32);
    this.tweens.add({
      targets: emojiText,
      y: emojiText.y - 50,
      x: emojiText.x + Phaser.Math.Between(-15, 15),
      scale: 1.3,
      alpha: 0,
      duration: 750,
      ease: "Back.easeOut",
      onComplete: () => emojiText.destroy(),
    });

    // Squash & Stretch
    this.tweens.add({
      targets: this.nomster,
      scaleX: 1.25,
      scaleY: 0.78,
      duration: 90,
      yoyo: true,
      repeat: 1,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.updateNomsterMood();
      },
    });

    this.createEatSparks(this.mouthCollider.x, this.mouthCollider.y);

    // Candy suction
    this.tweens.add({
      targets: this.candy,
      x: this.mouthCollider.x,
      y: this.mouthCollider.y,
      scale: 0.1,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        this.candy.disableBody(true, true);

        if (this.callbacks.onScoreUpdate) {
          this.callbacks.onScoreUpdate(this.score, this.streak);
        }
        if (this.callbacks.onNomNom) {
          this.callbacks.onNomNom();
        }

        this.time.delayedCall(400, () => {
          if (this.lives > 0) {
            const { width } = this.cameras.main;
            this.spawnCandy(Phaser.Math.Between(width * 0.2, width * 0.8), 45);
          }
        });
      },
    });
  }

  // Power-up activation engine
  private activatePowerUp(type: PowerUpType): void {
    const config = POWER_UPS[type];
    sounds.playPowerUpCollect();

    // Radiant popup notification
    const banner = this.add.text(
      this.cameras.main.width / 2,
      130,
      `${config.badge} COLLECTED!`,
      {
        fontFamily: "monospace",
        fontSize: "17px",
        color: config.color,
        stroke: "#000000",
        strokeThickness: 5,
      }
    );
    banner.setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      y: 95,
      scale: 1.2,
      alpha: 0,
      duration: 1500,
      onComplete: () => banner.destroy(),
    });

    if (type === "rainbow") {
      // Instant +2 extra score (total +3) & +1 life restore (capped at 10)
      this.score += 2;
      if (this.lives < this.maxCapLives) {
        this.lives += 1;
        if (this.callbacks.onLivesUpdate) {
          this.callbacks.onLivesUpdate(this.lives);
        }
        this.updateNomsterMood();
      }
      return;
    }

    if (type === "magnet") {
      this.activePowerUps.magnet = true;
      sounds.playMagnetHum();
      if (this.callbacks.onPowerUpActive) {
        this.callbacks.onPowerUpActive("magnet", config.durationMs / 1000);
      }
      if (this.magnetTimer) this.magnetTimer.remove();
      this.magnetTimer = this.time.delayedCall(config.durationMs, () => {
        this.activePowerUps.magnet = false;
        if (this.callbacks.onPowerUpExpired) {
          this.callbacks.onPowerUpExpired("magnet");
        }
      });
    } else if (type === "shield") {
      this.activePowerUps.shield = true;
      if (this.shieldSprite) this.shieldSprite.setVisible(true);
      if (this.callbacks.onPowerUpActive) {
        this.callbacks.onPowerUpActive("shield", config.durationMs / 1000);
      }
      if (this.shieldTimer) this.shieldTimer.remove();
      this.shieldTimer = this.time.delayedCall(config.durationMs, () => {
        if (this.activePowerUps.shield) {
          this.activePowerUps.shield = false;
          if (this.shieldSprite) this.shieldSprite.setVisible(false);
          if (this.callbacks.onPowerUpExpired) {
            this.callbacks.onPowerUpExpired("shield");
          }
        }
      });
    } else if (type === "slowmo") {
      this.activePowerUps.slowmo = true;
      sounds.playSlowMoWarp();
      if (this.candy) {
        this.candy.setGravityY(220);
      }
      if (this.callbacks.onPowerUpActive) {
        this.callbacks.onPowerUpActive("slowmo", config.durationMs / 1000);
      }
      if (this.slowmoTimer) this.slowmoTimer.remove();
      this.slowmoTimer = this.time.delayedCall(config.durationMs, () => {
        this.activePowerUps.slowmo = false;
        if (this.candy) {
          this.candy.setGravityY(460);
        }
        if (this.callbacks.onPowerUpExpired) {
          this.callbacks.onPowerUpExpired("slowmo");
        }
      });
    }
  }

  // Spawns the ethereal Winged Heart Life Candy every 2 minutes of active play
  public spawnWingedLifeCandy(): void {
    if (this.playState !== "playing" || this.lives <= 0) return;
    const { width } = this.cameras.main;
    const spawnX = Phaser.Math.Between(width * 0.2, width * 0.8);
    const spawnY = 35;

    if (this.wingedLifeCandy && this.wingedLifeCandy.active) {
      this.wingedLifeCandy.destroy();
    }
    if (this.wingedHeartLabel) {
      this.wingedHeartLabel.destroy();
    }

    this.wingedLifeCandy = this.physics.add.sprite(spawnX, spawnY, "winged_heart_candy");
    this.wingedLifeCandy.setCollideWorldBounds(true);
    this.wingedLifeCandy.setBounce(0.35, 0.35);
    this.wingedLifeCandy.setGravityY(130); // Ethereal slow parachute float
    this.wingedLifeCandy.setDrag(20, 10);
    this.wingedLifeCandy.setCircle(18, 10, 4);
    this.wingedLifeCandy.setDepth(20);
    this.wingedLifeCandy.setInteractive({ cursor: "pointer" });

    // Wing flutter tween
    this.tweens.add({
      targets: this.wingedLifeCandy,
      scaleX: 1.1,
      scaleY: 0.92,
      duration: 340,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Label: "❤️ +1 LIFE"
    this.wingedHeartLabel = this.add.text(spawnX, spawnY - 26, "❤️ +1 LIFE", {
      fontFamily: "monospace",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#fb7185",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.wingedHeartLabel.setOrigin(0.5);
    this.wingedHeartLabel.setDepth(21);

    // Overlap with Nomster mouth collider or body
    this.physics.add.overlap(this.wingedLifeCandy, this.mouthCollider, () => {
      this.handleEatWingedHeart();
    });
    this.physics.add.overlap(this.wingedLifeCandy, this.nomster, () => {
      this.handleEatWingedHeart();
    });

    // Soft fade if it reaches the floor without penalizing
    this.physics.add.overlap(this.wingedLifeCandy, this.groundSensor, () => {
      if (!this.wingedLifeCandy || !this.wingedLifeCandy.active) return;
      this.tweens.add({
        targets: [this.wingedLifeCandy, this.wingedHeartLabel],
        alpha: 0,
        scale: 0.2,
        duration: 350,
        onComplete: () => {
          if (this.wingedLifeCandy) this.wingedLifeCandy.destroy();
          if (this.wingedHeartLabel) this.wingedHeartLabel.destroy();
        },
      });
    });

    // Also clickable/tappable
    this.wingedLifeCandy.on("pointerdown", () => {
      this.handleEatWingedHeart();
    });
  }

  // Handles collecting the Winged Heart Candy
  private handleEatWingedHeart(): void {
    if (!this.wingedLifeCandy || !this.wingedLifeCandy.active) return;

    sounds.playHeartCollect();
    if (this.tongueSprite) {
      sounds.playTongueSlurp();
    }

    const heartX = this.wingedLifeCandy.x;
    const heartY = this.wingedLifeCandy.y;

    if (this.wingedHeartLabel) {
      this.wingedHeartLabel.destroy();
    }
    this.wingedLifeCandy.destroy();

    // Increase life capped at 10
    if (this.lives < this.maxCapLives) {
      this.lives = Math.min(this.maxCapLives, this.lives + 1);
      if (this.callbacks.onLivesUpdate) {
        this.callbacks.onLivesUpdate(this.lives);
      }
      this.updateNomsterMood();
    }

    // Spectacular celebration burst!
    const banner = this.add.text(
      this.cameras.main.width / 2,
      130,
      "💖 LIFE RESTORED! (+1 ❤️) 💖",
      {
        fontFamily: "monospace",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#fb7185",
        stroke: "#000000",
        strokeThickness: 5,
      }
    );
    banner.setOrigin(0.5);
    banner.setDepth(35);

    this.tweens.add({
      targets: banner,
      y: 95,
      scale: 1.25,
      alpha: 0,
      duration: 1600,
      ease: "Cubic.easeOut",
      onComplete: () => banner.destroy(),
    });

    // Floating fairy sparkle hearts
    for (let i = 0; i < 6; i++) {
      const spark = this.add.text(
        heartX + Phaser.Math.Between(-35, 35),
        heartY + Phaser.Math.Between(-35, 35),
        "💖",
        { fontSize: "18px" }
      );
      spark.setOrigin(0.5);
      spark.setDepth(34);
      this.tweens.add({
        targets: spark,
        y: spark.y - Phaser.Math.Between(40, 80),
        x: spark.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        scale: 1.4,
        duration: 900 + i * 100,
        ease: "Cubic.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
  }

  // Floor Miss Penalty with Shield Absorption
  private handleMissCandy(): void {
    if (this.isEating || this.lives <= 0) return;
    // If candy was just bounced upward by a trampoline or saved, ignore floor sensor
    if (this.candy && this.candy.body && this.candy.body.velocity.y < -50) return;

    if (this.toddlerMode) {
      // In Toddler Mode, missed candies never cost a life! Automatic marshmallow bounce saves it!
      sounds.playBoing();
      const vx = Phaser.Math.Between(-140, 140);
      this.candy.setVelocity(vx, -460);
      const saveText = this.add.text(this.candy.x, this.candy.y - 25, "💖 OOPSIE! SAVED! 💖", {
        fontFamily: "monospace",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#F472B6",
        stroke: "#000000",
        strokeThickness: 3,
      });
      saveText.setOrigin(0.5);
      this.tweens.add({
        targets: saveText,
        y: saveText.y - 45,
        alpha: 0,
        duration: 850,
        onComplete: () => saveText.destroy(),
      });
      return;
    }

    this.isEating = true;
    this.wakeNomster();

    if (this.bubbleSprite) {
      this.bubbleSprite.setVisible(false);
    }

    if (this.candyLabel) {
      this.candyLabel.setVisible(false);
    }

    if (this.isAnticipating) {
      this.isAnticipating = false;
      if (this.mouthGlow) {
        this.tweens.killTweensOf(this.mouthGlow);
        this.mouthGlow.setVisible(false);
      }
    }

    // Check Bubble Gum Shield absorption
    if (this.activePowerUps.shield) {
      this.activePowerUps.shield = false;
      if (this.shieldSprite) this.shieldSprite.setVisible(false);
      sounds.playShieldPop();

      if (this.callbacks.onPowerUpExpired) {
        this.callbacks.onPowerUpExpired("shield");
      }

      const shieldText = this.add.text(
        this.candy.x,
        this.candy.y - 20,
        "🫧 SHIELD PROTECTED LIFE!",
        {
          fontFamily: "monospace",
          fontSize: "15px",
          color: "#00C2FF",
          stroke: "#000000",
          strokeThickness: 4,
        }
      );
      shieldText.setOrigin(0.5);

      this.tweens.add({
        targets: shieldText,
        y: shieldText.y - 45,
        alpha: 0,
        duration: 800,
        onComplete: () => shieldText.destroy(),
      });

      this.candy.disableBody(true, true);
      this.time.delayedCall(450, () => {
        if (this.lives > 0) {
          const { width } = this.cameras.main;
          this.spawnCandy(width / 2, 45);
        }
      });
      return;
    }

    this.streak = 0;
    this.lives -= 1;

    sounds.playLifeLost();
    this.cameras.main.shake(250, 0.015);

    this.tweens.add({
      targets: this.nomster,
      scaleX: 0.85,
      scaleY: 1.2,
      angle: -8,
      duration: 120,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.nomster.angle = 0;
        this.updateNomsterMood();
      },
    });

    if (this.callbacks.onLivesUpdate) {
      this.callbacks.onLivesUpdate(this.lives);
    }

    const missText = this.add.text(this.candy.x, this.candy.y - 20, "MISSED! -1 ❤️", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#EF4444",
      stroke: "#000000",
      strokeThickness: 4,
    });
    missText.setOrigin(0.5);

    this.tweens.add({
      targets: missText,
      y: missText.y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => missText.destroy(),
    });

    if (this.lives <= 0) {
      this.playState = "gameover";
      if (this.callbacks.onGameStateChange) {
        this.callbacks.onGameStateChange("gameover");
      }
      this.triggerGameOver();
    } else {
      this.candy.disableBody(true, true);
      this.startCountdown("respawn", () => {
        const { width } = this.cameras.main;
        this.spawnCandy(width / 2, 45);
      });
    }
  }

  // Hit FUD Glitch Hazard with Shield Absorption
  private handleHitFUD(): void {
    if (this.isEating || this.lives <= 0) return;

    if (this.toddlerMode) {
      // In Toddler Mode, FUD is harmless and acts as a cheerful bouncy star bumper!
      sounds.playBoing();
      const vy = Phaser.Math.Between(-420, -320);
      const vx = Phaser.Math.Between(-150, 150);
      this.candy.setVelocity(vx, vy);
      const boingText = this.add.text(this.fudHazard.x, this.fudHazard.y - 20, "⭐ BOING! ⭐", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#14F195",
        stroke: "#000000",
        strokeThickness: 3,
      });
      boingText.setOrigin(0.5);
      this.tweens.add({
        targets: boingText,
        y: boingText.y - 30,
        alpha: 0,
        duration: 600,
        onComplete: () => boingText.destroy(),
      });
      return;
    }

    this.isEating = true;
    this.wakeNomster();

    if (this.bubbleSprite) {
      this.bubbleSprite.setVisible(false);
    }

    if (this.candyLabel) {
      this.candyLabel.setVisible(false);
    }

    // Check Bubble Gum Shield absorption
    if (this.activePowerUps.shield) {
      this.activePowerUps.shield = false;
      if (this.shieldSprite) this.shieldSprite.setVisible(false);
      sounds.playShieldPop();

      if (this.callbacks.onPowerUpExpired) {
        this.callbacks.onPowerUpExpired("shield");
      }

      const shieldText = this.add.text(
        this.fudHazard.x,
        this.fudHazard.y - 25,
        "🫧 SHIELD BLOCKED FUD!",
        {
          fontFamily: "monospace",
          fontSize: "15px",
          color: "#00C2FF",
          stroke: "#000000",
          strokeThickness: 4,
        }
      );
      shieldText.setOrigin(0.5);

      this.tweens.add({
        targets: shieldText,
        y: shieldText.y - 45,
        alpha: 0,
        duration: 800,
        onComplete: () => shieldText.destroy(),
      });

      this.candy.disableBody(true, true);
      this.time.delayedCall(450, () => {
        if (this.lives > 0) {
          const { width } = this.cameras.main;
          this.spawnCandy(width / 2, 45);
        }
      });
      return;
    }

    this.streak = 0;
    this.lives -= 1;

    sounds.playFUDHit();
    this.cameras.main.shake(300, 0.02);

    const fudText = this.add.text(this.fudHazard.x, this.fudHazard.y - 25, "FUD SPIKE! -1 ❤️", {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#EF4444",
      stroke: "#000000",
      strokeThickness: 4,
    });
    fudText.setOrigin(0.5);

    this.tweens.add({
      targets: fudText,
      y: fudText.y - 45,
      alpha: 0,
      duration: 800,
      onComplete: () => fudText.destroy(),
    });

    if (this.callbacks.onLivesUpdate) {
      this.callbacks.onLivesUpdate(this.lives);
    }

    if (this.lives <= 0) {
      this.playState = "gameover";
      if (this.callbacks.onGameStateChange) {
        this.callbacks.onGameStateChange("gameover");
      }
      this.triggerGameOver();
    } else {
      this.candy.disableBody(true, true);
      this.startCountdown("respawn", () => {
        const { width } = this.cameras.main;
        this.spawnCandy(width / 2, 45);
      });
    }
  }

  private triggerGameOver(): void {
    sounds.playGameOver();

    this.isAnticipating = false;
    if (this.mouthGlow) {
      this.tweens.killTweensOf(this.mouthGlow);
      this.mouthGlow.setVisible(false);
    }

    if (this.idleTween) this.idleTween.stop();

    this.tweens.add({
      targets: this.nomster,
      angle: 90,
      scaleX: 0.9,
      scaleY: 0.9,
      alpha: 0.6,
      duration: 450,
      ease: "Bounce.easeOut",
    });

    // Save Ghost Racer trajectory if this run was a new high score
    if (typeof window !== "undefined" && this.currentRunTrajectory.length > 0) {
      try {
        const storedHS = parseInt(localStorage.getItem("nomverse_highscore") || "0", 10);
        if (this.score >= storedHS) {
          localStorage.setItem(
            "nomverse_best_ghost_trajectory",
            JSON.stringify(this.currentRunTrajectory)
          );
        }
      } catch {
        // ignore
      }
    }

    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver(this.score);
    }
  }

  private activateFrenzyMode(): void {
    this.isFrenzy = true;
    sounds.playFrenzy();

    const banner = this.add.text(
      this.cameras.main.width / 2,
      120,
      "⚡ SOLANA FRENZY RAIN x2! ⚡",
      {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#14F195",
        stroke: "#9945FF",
        strokeThickness: 5,
      }
    );
    banner.setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      scale: 1.25,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        banner.destroy();
        this.isFrenzy = false;
      },
    });
  }

  private updateNomsterMood(): void {
    if (!this.nomster || this.lives <= 0) return;

    if (this.idleTween) {
      this.idleTween.stop();
    }

    if (this.lives === 3) {
      this.nomster.setTint(0xffffff);
      this.idleTween = this.tweens.add({
        targets: this.nomster,
        scaleY: 1.05,
        scaleX: 0.97,
        duration: 1200,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    } else if (this.lives === 2) {
      this.nomster.setTint(0xfef08a);
      this.idleTween = this.tweens.add({
        targets: this.nomster,
        scaleY: 1.03,
        scaleX: 0.98,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    } else if (this.lives === 1) {
      this.nomster.setTint(0xfca5a5);
      this.idleTween = this.tweens.add({
        targets: this.nomster,
        scaleX: 0.95,
        scaleY: 1.06,
        duration: 350,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createEatSparks(x: number, y: number): void {
    const colors = [0xf59e0b, 0x14f195, 0x9945ff, 0xfde047, 0xffffff];
    for (let i = 0; i < 14; i++) {
      const spark = this.add.circle(
        x,
        y,
        Phaser.Math.Between(3, 5),
        Phaser.Utils.Array.GetRandom(colors)
      );
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(80, 220);

      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.2,
        duration: 400,
        onComplete: () => spark.destroy(),
      });
    }

    const streakText =
      this.streak > 1 ? `+1 (x${this.streak} STREAK!)` : "+1 NOM!";
    const scoreText = this.add.text(x, y - 22, streakText, {
      fontFamily: "monospace",
      fontSize: "15px",
      color: this.streak >= 3 ? "#F59E0B" : "#14F195",
      stroke: "#04070D",
      strokeThickness: 4,
    });
    scoreText.setOrigin(0.5);

    this.tweens.add({
      targets: scoreText,
      y: y - 60,
      alpha: 0,
      scale: 1.25,
      duration: 700,
      ease: "Quad.easeOut",
      onComplete: () => scoreText.destroy(),
    });
  }

  // Sonic Super Dash Execution
  public performSuperDash(): boolean {
    if (
      !this.nomster ||
      !this.isDashReady ||
      this.lives <= 0 ||
      (this.playState !== "playing" && this.playState !== "countdown")
    ) {
      return false;
    }

    this.isDashReady = false;
    this.isInvulnerable = true;
    sounds.playDashWhoosh();
    nomsterVoice.speakSuperDash();

    if (this.callbacks.onDashCooldownUpdate) {
      this.callbacks.onDashCooldownUpdate(false);
    }

    const { width } = this.cameras.main;
    let dashDir = this.nomsterVelocityX !== 0 ? Math.sign(this.nomsterVelocityX) : (this.nomster.angle > 0 ? 1 : -1);
    if (dashDir === 0) dashDir = 1;

    const targetX = Phaser.Math.Clamp(this.nomster.x + dashDir * 135, 60, width - 60);

    // Spawn 3 ghost afterimage sprites
    for (let i = 1; i <= 3; i++) {
      this.time.delayedCall(i * 35, () => {
        if (!this.nomster) return;
        const ghost = this.add.sprite(this.nomster.x, this.nomster.y, "nomster");
        ghost.setOrigin(0.5, 0.85);
        ghost.setAngle(this.nomster.angle);
        ghost.setScale(this.nomster.scaleX, this.nomster.scaleY);
        ghost.setTint(i % 2 === 0 ? 0x9945ff : 0x14f195);
        ghost.setAlpha(0.65);
        ghost.setDepth(9);
        this.tweens.add({
          targets: ghost,
          alpha: 0,
          scale: 0.8,
          duration: 220,
          ease: "Sine.easeOut",
          onComplete: () => ghost.destroy(),
        });
      });
    }

    // Fast burst movement
    this.tweens.add({
      targets: this.nomster,
      x: targetX,
      scaleX: 1.3,
      scaleY: 0.75,
      duration: 160,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.nomster,
          scaleX: this.isFeverOverdrive ? 1.35 : 1.0,
          scaleY: this.isFeverOverdrive ? 1.35 : 1.0,
          duration: 100,
        });
      },
    });

    // Invulnerability duration 350ms
    this.time.delayedCall(350, () => {
      this.isInvulnerable = false;
    });

    // Cooldown 2.5s
    if (this.dashCooldownTimer) this.dashCooldownTimer.remove();
    this.dashCooldownTimer = this.time.delayedCall(2500, () => {
      this.isDashReady = true;
      if (this.callbacks.onDashCooldownUpdate) {
        this.callbacks.onDashCooldownUpdate(true);
      }
    });

    return true;
  }

  // Air Juggle & Deflection
  public performAirJuggle(): boolean {
    if (
      !this.nomster ||
      !this.candy ||
      !this.candy.active ||
      this.lives <= 0 ||
      this.playState !== "playing" ||
      this.isEating
    ) {
      return false;
    }

    const dist = Phaser.Math.Distance.Between(
      this.candy.x,
      this.candy.y,
      this.nomster.x,
      this.nomster.y - 40
    );

    if (dist < 145 && this.candy.y < this.nomster.y) {
      this.airJuggleCount++;
      sounds.playAirJuggle(this.airJuggleCount);
      this.addFeverPoints(15);

      // Bounce candy up
      const vx = Phaser.Math.Between(-160, 160);
      this.candy.setVelocity(vx, -460);
      this.candy.setAngularVelocity(vx * 2);

      // Nomster headbutt jump
      this.tweens.add({
        targets: this.nomster,
        y: this.nomster.y - 24,
        scaleY: 1.25,
        scaleX: 0.85,
        duration: 90,
        yoyo: true,
        ease: "Quad.easeOut",
      });

      // Floating Combo text
      const juggleText = this.add.text(
        this.candy.x,
        this.candy.y - 25,
        `AIR JUGGLE x${this.airJuggleCount}! 🔥`,
        {
          fontFamily: "monospace",
          fontSize: "15px",
          fontStyle: "bold",
          color: this.airJuggleCount >= 3 ? "#F59E0B" : "#14F195",
          stroke: "#000000",
          strokeThickness: 4,
        }
      );
      juggleText.setOrigin(0.5);
      this.tweens.add({
        targets: juggleText,
        y: juggleText.y - 50,
        scale: 1.3,
        alpha: 0,
        duration: 850,
        ease: "Quad.easeOut",
        onComplete: () => juggleText.destroy(),
      });

      return true;
    }

    return false;
  }

  // NOM-RAGE Fever Meter Charge
  public addFeverPoints(amount: number): void {
    if (this.isFeverOverdrive || this.lives <= 0) return;
    this.feverMeter = Math.min(100, this.feverMeter + amount);

    if (this.callbacks.onFeverMeterUpdate) {
      this.callbacks.onFeverMeterUpdate(this.feverMeter, false);
    }

    if (this.feverMeter >= 100) {
      this.activateFeverOverdrive();
    }
  }

  // Activates 8-second Fever Overdrive
  public activateFeverOverdrive(): void {
    if (this.isFeverOverdrive || !this.nomster) return;
    this.isFeverOverdrive = true;
    sounds.playFeverActive();
    nomsterVoice.speakFever();
    this.cameras.main.shake(300, 0.015);

    if (this.callbacks.onFeverMeterUpdate) {
      this.callbacks.onFeverMeterUpdate(100, true);
    }

    // Nomster expansion
    this.tweens.add({
      targets: this.nomster,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 250,
      ease: "Back.easeOut",
    });

    const { width } = this.cameras.main;
    const banner = this.add.text(
      width / 2,
      135,
      "⚡ NOM-RAGE OVERDRIVE! 3X POINTS! ⚡",
      {
        fontFamily: "monospace",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#F59E0B",
        backgroundColor: "#050914FA",
        padding: { x: 14, y: 7 },
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      }
    );
    banner.setOrigin(0.5);
    banner.setDepth(30);
    this.tweens.add({
      targets: banner,
      y: 110,
      alpha: 0,
      duration: 2000,
      onComplete: () => banner.destroy(),
    });

    if (this.feverTimer) this.feverTimer.remove();
    this.feverTimer = this.time.delayedCall(8000, () => {
      this.isFeverOverdrive = false;
      this.feverMeter = 0;
      if (this.callbacks.onFeverMeterUpdate) {
        this.callbacks.onFeverMeterUpdate(0, false);
      }
      this.tweens.add({
        targets: this.nomster,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 220,
      });
    });
  }

  // Spawns In-Game Canvas Boss (Lord Mega-FUD)
  private spawnBoss(): void {
    const { width } = this.cameras.main;
    this.bossCurrentHp = 100;
    this.isBossDefeated = false;

    const container = this.add.container(width / 2, 90);
    this.bossContainer = container;
    container.setDepth(15);

    // Boss Sprite
    const bossSprite = this.add.sprite(0, 0, "lord_megafud_boss");
    bossSprite.setScale(1.25);
    container.add(bossSprite);
    this.bossSprite = bossSprite;

    // HP Bar background
    const barBg = this.add.rectangle(0, 38, 190, 10, 0x050914, 0.9);
    barBg.setStrokeStyle(1.5, 0xef4444, 0.8);
    container.add(barBg);

    // HP Bar Fill
    const barFill = this.add.rectangle(-95, 38, 190, 8, 0xef4444, 0.95);
    barFill.setOrigin(0, 0.5);
    container.add(barFill);
    this.bossHpBar = barFill;

    // HP Bar Label
    const barText = this.add.text(0, 52, "LORD MEGA-FUD (100 HP)", {
      fontFamily: "monospace",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#FCA5A5",
    });
    barText.setOrigin(0.5);
    container.add(barText);
    this.bossHpText = barText;

    // Boss Hover Tween
    this.bossMoveTween = this.tweens.add({
      targets: container,
      x: { from: 75, to: width - 75 },
      y: { from: 85, to: 95 },
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Boss Attack Laser Loop
    if (this.bossLaserTimer) this.bossLaserTimer.remove();
    this.bossLaserTimer = this.time.addEvent({
      delay: 3400,
      repeat: -1,
      callback: () => this.bossFireLaser(),
    });

    if (this.callbacks.onBossHpUpdate) {
      this.callbacks.onBossHpUpdate(this.bossCurrentHp, this.bossMaxHp);
    }
  }

  // Boss fires red laser bolt downward
  private bossFireLaser(): void {
    if (
      this.isBossDefeated ||
      !this.bossContainer ||
      this.playState !== "playing" ||
      this.lives <= 0
    ) {
      return;
    }

    sounds.playFUDHit();
    const laser = this.physics.add.sprite(
      this.bossContainer.x,
      this.bossContainer.y + 35,
      "fud_laser"
    );
    laser.setDepth(14);
    laser.setVelocityY(340);
    laser.setCollideWorldBounds(false);

    const laserOverlap = this.physics.add.overlap(laser, this.mouthCollider, () => {
      laser.destroy();
      laserOverlap.destroy();

      if (this.isInvulnerable) {
        sounds.playDashWhoosh();
        return;
      }

      if (this.activePowerUps.shield) {
        this.activePowerUps.shield = false;
        if (this.shieldSprite) this.shieldSprite.setVisible(false);
        sounds.playShieldPop();
        if (this.callbacks.onPowerUpExpired) this.callbacks.onPowerUpExpired("shield");
        return;
      }

      // Life lost from boss laser
      this.lives -= 1;
      this.streak = 0;
      this.airJuggleCount = 0;
      sounds.playLifeLost();
      this.cameras.main.shake(250, 0.015);

      if (this.callbacks.onLivesUpdate) {
        this.callbacks.onLivesUpdate(this.lives);
      }

      if (this.lives <= 0) {
        this.playState = "gameover";
        if (this.callbacks.onGameStateChange) this.callbacks.onGameStateChange("gameover");
        this.triggerGameOver();
      }
    });

    // Cleanup laser after exiting bottom
    this.time.delayedCall(2200, () => {
      if (laser.active) laser.destroy();
    });
  }

  // Fires photon spit blast up at Lord Mega-FUD
  private firePhotonAtBoss(): void {
    if (!this.bossContainer || this.isBossDefeated) return;

    const photon = this.add.sprite(
      this.mouthCollider.x,
      this.mouthCollider.y - 20,
      "photon_spit"
    );
    photon.setDepth(14);

    this.tweens.add({
      targets: photon,
      x: this.bossContainer.x,
      y: this.bossContainer.y,
      duration: 320,
      ease: "Quad.easeIn",
      onComplete: () => {
        photon.destroy();
        if (this.isBossDefeated) return;

        sounds.playBossHit();
        const dmg = this.isFeverOverdrive ? 30 : 15;
        this.bossCurrentHp = Math.max(0, this.bossCurrentHp - dmg);

        // Flash boss white
        if (this.bossSprite) {
          this.bossSprite.setTint(0xffffff);
          this.time.delayedCall(100, () => {
            if (this.bossSprite) this.bossSprite.clearTint();
          });
        }

        // Update HP Bar
        if (this.bossHpBar) {
          const pct = Math.max(0, this.bossCurrentHp / this.bossMaxHp);
          this.bossHpBar.setScale(pct, 1);
        }
        if (this.bossHpText) {
          this.bossHpText.setText(`LORD MEGA-FUD (${this.bossCurrentHp} HP)`);
        }

        if (this.callbacks.onBossHpUpdate) {
          this.callbacks.onBossHpUpdate(this.bossCurrentHp, this.bossMaxHp);
        }

        if (this.bossCurrentHp <= 0) {
          this.isBossDefeated = true;
          sounds.playBossDefeated();
          this.cameras.main.shake(500, 0.02);

          if (this.bossLaserTimer) this.bossLaserTimer.remove();
          if (this.bossMoveTween) this.bossMoveTween.stop();

          // Boss death explosion
          this.tweens.add({
            targets: this.bossContainer,
            scaleX: 1.6,
            scaleY: 1.6,
            alpha: 0,
            duration: 700,
            ease: "Power2",
            onComplete: () => {
              this.bossContainer?.destroy();
              this.bossContainer = undefined;
              this.handleEpisodeComplete();
            },
          });
        }
      },
    });
  }

  // Handles completion of an episodic chapter
  private handleEpisodeComplete(): void {
    if (!this.currentEpisodeConfig) return;

    // Determine star rating based on lives remaining
    const stars = this.lives >= 3 ? 3 : this.lives === 2 ? 2 : 1;

    // Stop candy drops
    if (this.candy) {
      this.candy.disableBody(true, true);
    }

    nomsterVoice.speakVictory();

    if (this.callbacks.onEpisodeComplete) {
      this.callbacks.onEpisodeComplete(this.currentEpisodeConfig.id, this.score, stars);
    }
  }

  public resetGame(livesCount: number = 5): void {
    this.score = 0;
    this.streak = 0;
    this.airJuggleCount = 0;
    this.feverMeter = 0;
    this.isFeverOverdrive = false;
    this.isDashReady = true;
    this.isInvulnerable = false;
    this.nextLifeDropSeconds = 120;

    if (this.wingedLifeCandy && this.wingedLifeCandy.active) {
      this.wingedLifeCandy.destroy();
      this.wingedLifeCandy = undefined;
    }
    if (this.wingedHeartLabel) {
      this.wingedHeartLabel.destroy();
      this.wingedHeartLabel = undefined;
    }
    if (this.tongueSprite) {
      this.tongueSprite.setVisible(false);
    }
    if (this.landingGuideGraphics) {
      this.landingGuideGraphics.clear();
    }

    if (this.feverTimer) this.feverTimer.remove();
    if (this.dashCooldownTimer) this.dashCooldownTimer.remove();
    if (this.callbacks.onFeverMeterUpdate) {
      this.callbacks.onFeverMeterUpdate(0, false);
    }
    if (this.callbacks.onDashCooldownUpdate) {
      this.callbacks.onDashCooldownUpdate(true);
    }

    this.lives = Math.min(this.maxCapLives, livesCount);
    this.isEating = false;
    this.isAnticipating = false;
    this.isChonkyGummy = false;
    this.isSoapBubble = false;
    if (this.bubbleSprite) {
      this.bubbleSprite.setVisible(false);
    }
    this.wakeNomster();
    if (this.mouthGlow) {
      this.tweens.killTweensOf(this.mouthGlow);
      this.mouthGlow.setVisible(false);
    }

    // Reset power-ups
    this.activePowerUps = { magnet: false, shield: false, slowmo: false };
    if (this.shieldSprite) this.shieldSprite.setVisible(false);
    if (this.candy) {
      this.candy.setGravityY(460);
      this.candy.disableBody(true, true);
    }

    if (this.bossContainer) {
      this.bossContainer.destroy();
      this.bossContainer = undefined;
    }
    if (this.bossLaserTimer) {
      this.bossLaserTimer.remove();
    }
    if (this.currentEpisodeConfig?.isBossEpisode) {
      this.spawnBoss();
    }

    if (this.nomster) {
      this.nomster.setAngle(0);
      this.nomster.setScale(1.0);
      this.nomster.setAlpha(1);
      this.updateNomsterMood();
    }
    this.updateStageEnvironment(this.currentEpisodeConfig ? this.currentEpisodeConfig.stageEnvironment : "meadow");

    if (this.rival) {
      this.rivalBeaten = false;
      this.renderRivalBanner();
    }

    if (this.callbacks.onLivesUpdate) {
      this.callbacks.onLivesUpdate(this.lives);
    }
    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate(this.score, this.streak);
    }

    this.startGame();
  }
}
