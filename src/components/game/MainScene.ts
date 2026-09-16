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
}

export class MainScene extends Phaser.Scene {
  private nomster!: Phaser.GameObjects.Sprite;
  private mouthCollider!: Phaser.GameObjects.Arc;
  private candy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private fudHazard!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private groundSensor!: Phaser.GameObjects.Rectangle;
  private aimGraphics?: Phaser.GameObjects.Graphics;

  // Power-Ups and Cosmetics
  private currentSkin: SkinId = "default";
  private accessorySprite?: Phaser.GameObjects.Sprite;
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
  }): void {
    if (data && data.callbacks) {
      this.callbacks = data.callbacks;
    }
    if (data && typeof data.initialLives === "number") {
      this.lives = data.initialLives;
    } else {
      this.lives = 3;
    }
    if (data && data.initialSkin) {
      this.currentSkin = data.initialSkin;
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

    // Background Gradient with Cyber Grid
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x0a101f, 0x0a101f, 0x04070d, 0x04070d, 1);
    bgGraphics.fillRect(0, 0, width, height);

    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x18243b, 0.35);
    for (let x = 0; x < width; x += 36) {
      gridGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 36) {
      gridGraphics.lineBetween(0, y, width, y);
    }

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
    this.nomster.setInteractive({ cursor: "grab" });

    // Nomster Mouth Trigger Area
    this.mouthCollider = this.add.circle(width / 2, nomsterY - 34, 24, 0x000000, 0);
    this.physics.add.existing(this.mouthCollider, true);

    // Bubble Gum Shield Sprite
    this.shieldSprite = this.add.sprite(width / 2, nomsterY - 40, "shield_bubble");
    this.shieldSprite.setVisible(false);
    this.shieldSprite.setAlpha(0.85);

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

    if (this.callbacks.onLivesUpdate) {
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  // Update loop for Magnetic Pull and attached sprites alignment
  public override update(time: number, delta: number): void {
    if (!this.nomster) return;

    // Keep mouth collider synced
    this.mouthCollider.x = this.nomster.x;

    // Keep accessory synchronized with Nomster movement and tilt
    if (this.accessorySprite && this.accessorySprite.visible) {
      const offset = this.getSkinOffset(this.currentSkin);
      const rad = Phaser.Math.DegToRad(this.nomster.angle);
      const rotatedOffsetX = offset.x * Math.cos(rad) - offset.y * Math.sin(rad);
      const rotatedOffsetY = offset.x * Math.sin(rad) + offset.y * Math.cos(rad);

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

  // Generates 2D canvas textures for skins and shield
  private createProceduralTextures(): void {
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

  private spawnCandy(x: number, y: number): void {
    const { width } = this.cameras.main;
    const spawnX = x || Phaser.Math.Between(width * 0.2, width * 0.8);
    const spawnY = y || 45;

    // Roll for special power-up candy
    this.currentPowerUpType = rollForPowerUp(this.score);

    const baseGravity = this.activePowerUps.slowmo ? 220 : 460;

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

    this.score++;
    this.streak++;

    if (this.streak === 10) {
      this.activateFrenzyMode();
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

    if (this.callbacks.onLivesUpdate) {
      this.callbacks.onLivesUpdate(this.lives);
    }
    if (this.callbacks.onScoreUpdate) {
      this.callbacks.onScoreUpdate(this.score, this.streak);
    }

    this.startGame();
  }
}
