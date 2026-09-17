import * as Phaser from "phaser";
import { sounds } from "../audio/soundEffects";
import { PowerUpType, POWER_UPS, rollForPowerUp } from "@/lib/powerUps";
import { SkinId } from "@/lib/skins";

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

  public init(data: {
    callbacks?: SceneCallbacks;
    initialLives?: number;
    initialSkin?: SkinId;
    rival?: { score: number; challenger: string };
    holderTierPerks?: {
      extraLives: number;
      scoreMultiplier: number;
      raidMultiplier: number;
      hasCrown: boolean;
    };
  }): void {
    if (data && data.callbacks) {
      this.callbacks = data.callbacks;
    }
    if (data && data.holderTierPerks) {
      this.holderTierPerks = data.holderTierPerks;
    }
    const baseLives = (data && typeof data.initialLives === "number") ? data.initialLives : 3;
    this.lives = baseLives + (this.holderTierPerks?.extraLives || 0);

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
    this.score = 0;
    this.streak = 0;
    this.isFrenzy = false;
    this.isGameStarted = false;
    this.playState = "idle";
    this.activePowerUps = { magnet: false, shield: false, slowmo: false };
    if (this.callbacks.onGameStateChange) {
      this.callbacks.onGameStateChange("idle");
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
    this.initStarfield();
    this.updateStageEnvironment("meadow");

    this.aimGraphics = this.add.graphics();

    // Floor Sensor Line (Bottom Out of Bounds)
    const floorY = height - 12;
    this.groundSensor = this.add.rectangle(width / 2, floorY, width, 24, 0xef4444, 0);
    this.physics.add.existing(this.groundSensor, true);

    // Nomster Setup at Bottom Center
    const nomsterY = height - 76;
    this.nomster = this.add.sprite(width / 2, nomsterY, "nomster");
    this.nomster.setOrigin(0.5, 0.85);
    this.nomster.setScale(1.0);
    this.nomster.setDepth(10);
    this.nomster.setInteractive({ cursor: "grab" });

    // Nomster Mouth Trigger Area
    this.mouthCollider = this.add.circle(width / 2, nomsterY - 34, 24, 0x000000, 0);
    this.physics.add.existing(this.mouthCollider, true);

    // Nomster Anticipation Mouth Glow
    this.mouthGlow = this.add.circle(width / 2, nomsterY - 34, 18, 0xf43f5e, 0.65);
    this.mouthGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.mouthGlow.setDepth(11);
    this.mouthGlow.setVisible(false);

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

    // Collisions & Overlaps
    this.physics.add.overlap(this.candy, this.mouthCollider, () => {
      this.handleEatCandy();
    });

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

  // Update loop for Starfield, Eye Tracking, Mouth Anticipation, Trails, and Magnetic Pull
  public override update(time: number, delta: number): void {
    if (!this.nomster) return;

    const dt = delta / 1000;
    const { width: camWidth, height: camHeight } = this.cameras.main;

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

    if (this.leftPupil) {
      this.leftPupil.setPosition(pupilLX, pupilLY);
      this.leftPupil.setAngle(this.nomster.angle);
    }
    if (this.rightPupil) {
      this.rightPupil.setPosition(pupilRX, pupilRY);
      this.rightPupil.setAngle(this.nomster.angle);
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

    // Solana Magnet: Tractor beam pull towards Nomster's mouth
    if (
      this.activePowerUps.magnet &&
      this.candy &&
      !this.isEating &&
      this.lives > 0 &&
      this.candy.active
    ) {
      const dx = this.mouthCollider.x - this.candy.x;
      const dy = this.mouthCollider.y - this.candy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 15 && dist < 420) {
        const pullFactor = 280;
        const currentVx = this.candy.body?.velocity.x || 0;
        const currentVy = this.candy.body?.velocity.y || 0;
        const targetVx = (dx / dist) * pullFactor;
        const targetVy = Math.max((dy / dist) * pullFactor, 120);

        this.candy.setVelocity(
          currentVx * 0.88 + targetVx * 0.12,
          currentVy * 0.88 + targetVy * 0.12
        );

        // Gentle magnet spark trail
        if (Math.random() < 0.25) {
          const spark = this.add.circle(
            this.candy.x + Phaser.Math.Between(-8, 8),
            this.candy.y + Phaser.Math.Between(-8, 8),
            2,
            0x9945ff,
            0.8
          );
          this.tweens.add({
            targets: spark,
            alpha: 0,
            y: spark.y + 15,
            duration: 250,
            onComplete: () => spark.destroy(),
          });
        }
      }
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
    if (this.lives <= 0) return;
    this.waddleNomsterTo(this.nomster.x - 75);
  }

  public waddleRight(): void {
    if (this.lives <= 0) return;
    this.waddleNomsterTo(this.nomster.x + 75);
  }

  private setupInteractivity(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.lives <= 0) return;

      if (!this.isGameStarted || this.playState === "idle") {
        this.startGame();
        return;
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
      const distToNomster = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.nomster.x, this.nomster.y);

      if (distToCandy < 65) {
        this.isDraggingCandy = true;
      } else if (distToNomster < 80 || pointer.y > this.nomster.y - 60) {
        this.isMovingNomster = true;
        this.waddleNomsterTo(pointer.x);
      } else {
        this.nudgeCandyTowardsNomster(pointer.x, pointer.y);
      }
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
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

  private waddleNomsterTo(targetX: number): void {
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

    const subtitle = this.add.text(0, 38, "3 Lives • Drag Nomster to Eat", {
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
    if (this.currentStageId === "moon") return 220;
    if (this.currentStageId === "matrix") return 540;
    if (this.currentStageId === "hyperdrive") return 480;
    return 460;
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

    // Roll for special power-up candy
    this.currentPowerUpType = rollForPowerUp(this.score);

    const baseGravity = this.activePowerUps.slowmo ? 180 : this.getStageGravity();

    if (!this.candy) {
      this.candy = this.physics.add.sprite(spawnX, spawnY, "candy");
      this.candy.setCollideWorldBounds(true);
      this.candy.setBounce(0.65, 0.65);
      this.candy.setGravityY(baseGravity);
      this.candy.setDrag(15, 10);
      this.candy.setCircle(20, 2, 2);
    } else {
      this.candy.enableBody(true, spawnX, spawnY, true, true);
      this.candy.setScale(0);
      this.candy.setAlpha(1);
      this.candy.setGravityY(baseGravity);

      const vx = Phaser.Math.Between(-90, 90);
      this.candy.setVelocity(vx, Phaser.Math.Between(-30, 20));
      this.candy.setAngularVelocity(Phaser.Math.Between(-140, 140));

      this.tweens.add({
        targets: this.candy,
        scale: 1,
        duration: 250,
        ease: "Back.easeOut",
      });
    }

    // Apply Power-Up Visual Dressing
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
    } else {
      this.candy.clearTint();
      if (this.candyLabel) {
        this.candyLabel.setVisible(false);
      }
    }

    this.isEating = false;
  }

  private handleEatCandy(): void {
    if (this.isEating || this.lives <= 0) return;
    this.isEating = true;

    if (this.candyLabel) {
      this.candyLabel.setVisible(false);
    }

    // Check if candy was a special power-up
    if (this.currentPowerUpType) {
      this.activatePowerUp(this.currentPowerUpType);
    }

    let pointsEarned = 1;
    if (this.isFrenzy) {
      pointsEarned *= 2;
    }
    if (this.holderTierPerks?.scoreMultiplier && this.holderTierPerks.scoreMultiplier > 1) {
      pointsEarned = Math.max(1, Math.round(pointsEarned * this.holderTierPerks.scoreMultiplier));
    }

    this.score += pointsEarned;
    this.streak++;

    // Dynamic Stage Upgrade Check (Level Up!)
    this.checkStageProgression(this.score);

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

    sounds.playNom();

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
      // Instant +2 extra score (total +3) & +1 life restore
      this.score += 2;
      if (this.lives < 3) {
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

  // Floor Miss Penalty with Shield Absorption
  private handleMissCandy(): void {
    if (this.isEating || this.lives <= 0) return;
    this.isEating = true;

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
    this.isEating = true;

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
    if (this.lives <= 0) return;

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

  public resetGame(livesCount: number = 3): void {
    this.score = 0;
    this.streak = 0;
    this.lives = livesCount;
    this.isEating = false;
    this.isAnticipating = false;
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

    this.nomster.setAngle(0);
    this.nomster.setScale(1.0);
    this.nomster.setAlpha(1);
    this.updateNomsterMood();
    this.updateStageEnvironment("meadow");

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
