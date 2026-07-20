"use client";

import React, { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playRetroSound as playRetroSoundImport } from "@/lib/audio";

// Color mappings for pixel drawing
const COLOR_MAP: Record<string, string> = {
  R: "#FF0000", // Red
  B: "#732900", // Brown
  P: "#FFCC99", // Peach/Skin
  L: "#0020C2", // Blue (Overalls)
  Y: "#FFE600", // Yellow (Buttons)
  G: "#00A800", // Dark Green
  K: "#000000", // Black
  W: "#FFFFFF", // White
};

// 8-bit Mario Sprite (12px wide, 16px high)
const MARIO_SPRITE = [
  [null, null, null, "R", "R", "R", "R", "R", null, null, null, null],
  [null, null, "R", "R", "R", "R", "R", "R", "R", "R", "R", null],
  [null, null, "B", "B", "B", "P", "P", "B", "P", null, null, null],
  [null, "B", "P", "B", "P", "P", "P", "B", "P", "P", "P", null],
  [null, "B", "P", "B", "B", "P", "P", "P", "B", "P", "P", "P"],
  [null, "B", "B", "P", "P", "P", "P", "B", "B", "B", "B", null],
  [null, null, null, "P", "P", "P", "P", "P", "P", "P", null, null],
  [null, null, "R", "R", "L", "R", "R", "R", null, null, null, null],
  [null, "R", "R", "R", "L", "R", "R", "L", "R", "R", "R", null],
  ["R", "R", "R", "R", "L", "L", "L", "L", "R", "R", "R", "R"],
  ["P", "P", "R", "L", "Y", "L", "L", "Y", "L", "R", "P", "P"],
  ["P", "P", "P", "L", "L", "L", "L", "L", "L", "P", "P", "P"],
  ["P", "P", "L", "L", "L", "L", "L", "L", "L", "L", "P", "P"],
  [null, null, "L", "L", "L", null, null, "L", 'L', "L", null, null],
  [null, "B", "B", "B", null, null, null, null, "B", "B", "B", null],
  ["B", "B", "B", "B", null, null, null, null, "B", "B", "B", "B"]
];

// Goomba Sprite (16px wide, 16px high)
const GOOMBA_SPRITE = [
  [null, null, null, null, null, "B", "B", "B", "B", "B", "B", null, null, null, null, null],
  [null, null, null, "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", null, null, null],
  [null, null, "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", null, null],
  [null, "B", "B", "B", "K", "K", "B", "B", "B", "B", "K", "K", "B", "B", "B", null],
  [null, "B", "B", "B", "W", "W", "B", "B", "B", "B", "W", "W", "B", "B", "B", null],
  [null, "B", "B", "B", "K", "K", "B", "B", "B", "B", "K", "K", "B", "B", "B", null],
  [null, "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", null],
  [null, "B", "B", "B", "B", "P", "P", "P", "P", "P", "P", "B", "B", "B", "B", null],
  [null, null, "B", "B", "P", "P", "P", "P", "P", "P", "P", "P", "B", "B", null, null],
  [null, null, "B", "B", "P", "P", "P", "P", "P", "P", "P", "P", "B", "B", null, null],
  [null, null, null, "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", null, null, null],
  [null, null, null, "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", null, null, null],
  [null, null, "K", "K", "K", "P", "P", "P", "P", "P", "P", "K", "K", "K", null, null],
  [null, "K", "K", "K", "K", "K", "P", "P", "P", "P", "K", "K", "K", "K", "K", null],
  [null, "K", "K", "K", "K", "K", null, null, null, null, "K", "K", "K", "K", "K", null],
  [null, null, "K", "K", "K", null, null, null, null, null, null, "K", "K", "K", null, null]
];

export default function AdminArcadePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [collectedCoins, setCollectedCoins] = useState(0);

  // References to keep game loop variables without re-triggering React renders
  const stateRef = useRef({
    mario: { x: 80, y: 260, vy: 0, width: 36, height: 48, isJumping: false },
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number; type: "pipe" | "goomba"; speed: number }>,
    coins: [] as Array<{ x: number; y: number; width: number; height: number; collected: boolean; pulse: number }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }>,
    bgScroll: 0,
    gameSpeed: 4.5,
    frameCount: 0,
    score: 0,
    coinsCollected: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHighScore(Number(localStorage.getItem("admin_arcade_highscore") || "0"));
    }
  }, []);

  // Web Audio API Retro sound synthesizers
  const playRetroSound = (type: "jump" | "coin" | "gameover" | "kick") => {
    if (!soundEnabled) return;
    playRetroSoundImport(type === "jump" ? "arcade_jump" : type);
  };

  // Helper to draw pixel sprite on Canvas
  const drawSprite = (
    ctx: CanvasRenderingContext2D,
    sprite: Array<Array<string | null>>,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const rows = sprite.length;
    const cols = sprite[0].length;
    const pixelW = w / cols;
    const pixelH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorKey = sprite[r][c];
        if (colorKey && COLOR_MAP[colorKey]) {
          ctx.fillStyle = COLOR_MAP[colorKey];
          ctx.fillRect(
            Math.floor(x + c * pixelW),
            Math.floor(y + r * pixelH),
            Math.ceil(pixelW),
            Math.ceil(pixelH)
          );
        }
      }
    }
  };

  const jump = () => {
    const game = stateRef.current;
    if (!game.mario.isJumping && gameState === "playing") {
      game.mario.vy = -12;
      game.mario.isJumping = true;
      playRetroSound("jump");
    }
  };

  const startNewGame = () => {
    stateRef.current = {
      mario: { x: 80, y: 262, vy: 0, width: 33, height: 44, isJumping: false },
      obstacles: [],
      coins: [],
      particles: [],
      bgScroll: 0,
      gameSpeed: 4.5,
      frameCount: 0,
      score: 0,
      coinsCollected: 0,
    };
    setScore(0);
    setCollectedCoins(0);
    setGameState("playing");
  };

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const updateAndDraw = () => {
      if (gameState !== "playing") return;

      const game = stateRef.current;
      game.frameCount++;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── DRAW BACKGROUND (Mario Sky & Ground) ─────────────────────────────────
      // Sky blue
      ctx.fillStyle = "#5c94fc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scroll speed
      game.bgScroll = (game.bgScroll + game.gameSpeed * 0.4) % canvas.width;

      // Draw clouds in background
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      for (let i = 0; i < 3; i++) {
        const cloudX = (i * 350 - game.bgScroll * 0.5 + canvas.width) % (canvas.width + 150) - 100;
        // Simple pixel clouds
        ctx.fillRect(cloudX, 80, 80, 20);
        ctx.fillRect(cloudX + 15, 65, 50, 15);
        ctx.fillRect(cloudX + 30, 50, 25, 15);
      }

      // Draw green distant hills
      ctx.fillStyle = "#00b800";
      for (let i = 0; i < 4; i++) {
        const hillX = (i * 250 - game.bgScroll * 0.8 + canvas.width) % (canvas.width + 100) - 50;
        ctx.beginPath();
        ctx.moveTo(hillX, 310);
        ctx.lineTo(hillX + 80, 210);
        ctx.lineTo(hillX + 160, 310);
        ctx.fill();
      }

      // Draw Brick Ground
      ctx.fillStyle = "#fcb444";
      ctx.fillRect(0, 310, canvas.width, canvas.height - 310);
      // Draw retro grid lines on ground
      ctx.fillStyle = "#9c4a00";
      ctx.fillRect(0, 310, canvas.width, 6);
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.fillRect(x, 316, 4, canvas.height - 316);
        ctx.fillRect(x, 335, 32, 4);
        ctx.fillRect(x, 365, 32, 4);
      }

      // ── PHYSICS & CONTROLS (Mario) ──────────────────────────────────────────
      game.mario.vy += 0.65; // gravity
      game.mario.y += game.mario.vy;

      // Keep Mario above ground level (ground Y is 310, height of player is 44, so y should be <= 266)
      if (game.mario.y >= 266) {
        game.mario.y = 266;
        game.mario.vy = 0;
        game.mario.isJumping = false;
      }

      // Render Mario sprite
      drawSprite(ctx, MARIO_SPRITE, game.mario.x, game.mario.y, game.mario.width, game.mario.height);

      // ── SPAWN SYSTEM ────────────────────────────────────────────────────────
      // Increase game speed slowly
      if (game.frameCount % 500 === 0) {
        game.gameSpeed += 0.35;
      }

      // Spawn pipes and Goombas
      if (game.frameCount % 110 === 0 && Math.random() > 0.3) {
        const isPipe = Math.random() > 0.45;
        if (isPipe) {
          game.obstacles.push({
            x: canvas.width + 20,
            y: 254, // pipe sitting on ground
            width: 38,
            height: 56,
            type: "pipe",
            speed: game.gameSpeed,
          });
        } else {
          game.obstacles.push({
            x: canvas.width + 20,
            y: 280, // Goomba sitting on ground
            width: 30,
            height: 30,
            type: "goomba",
            speed: game.gameSpeed,
          });
        }
      }

      // Spawn floating coins
      if (game.frameCount % 90 === 0 && Math.random() > 0.5) {
        game.coins.push({
          x: canvas.width + 20,
          y: Math.random() > 0.5 ? 180 : 220, // heights Mario can reach by jumping
          width: 18,
          height: 24,
          collected: false,
          pulse: 0,
        });
      }

      // ── OBSTACLE PROCESSING ──────────────────────────────────────────────────
      for (let i = game.obstacles.length - 1; i >= 0; i--) {
        const obs = game.obstacles[i];
        obs.x -= obs.speed;

        // Draw Obstacle
        if (obs.type === "pipe") {
          // Render classic Green Mario Pipe
          ctx.fillStyle = "#00A800";
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          // Pipe rim
          ctx.fillRect(obs.x - 3, obs.y, obs.width + 6, 16);
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#000000";
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x - 3, obs.y, obs.width + 6, 16);
          // Light highlight on pipe
          ctx.fillStyle = "#88D800";
          ctx.fillRect(obs.x + 5, obs.y + 16, 6, obs.height - 16);
          ctx.fillRect(obs.x + 2, obs.y + 3, 6, 10);
        } else {
          // Render Goomba sprite
          drawSprite(ctx, GOOMBA_SPRITE, obs.x, obs.y, obs.width, obs.height);
        }

        // Collision Check (AABB box collision)
        const buffer = 4; // collision buffer
        if (
          game.mario.x + buffer < obs.x + obs.width &&
          game.mario.x + game.mario.width - buffer > obs.x &&
          game.mario.y + buffer < obs.y + obs.height &&
          game.mario.y + game.mario.height - buffer > obs.y
        ) {
          // If Mario lands on top of a Goomba, he crushes it!
          if (obs.type === "goomba" && game.mario.vy > 0 && game.mario.y + game.mario.height - game.mario.vy <= obs.y + 12) {
            playRetroSound("kick");
            game.obstacles.splice(i, 1);
            // bounce Mario back up slightly
            game.mario.vy = -6;
            game.score += 100;
            setScore(game.score);
            // spawn particles
            for (let p = 0; p < 8; p++) {
              game.particles.push({
                x: obs.x + obs.width / 2,
                y: obs.y + obs.y / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 4,
                color: "#732900",
                life: 30,
              });
            }
            continue;
          } else {
            // Otherwise, Game Over
            setGameState("gameover");
            playRetroSound("gameover");

            // Update high score
            if (game.score > highScore) {
              setHighScore(game.score);
              localStorage.setItem("admin_arcade_highscore", String(game.score));
            }
            return;
          }
        }

        // Offscreen removal & point earning
        if (obs.x + obs.width < 0) {
          game.obstacles.splice(i, 1);
          game.score += 10;
          setScore(game.score);
        }
      }

      // ── COIN PROCESSING ──────────────────────────────────────────────────────
      for (let i = game.coins.length - 1; i >= 0; i--) {
        const coin = game.coins[i];
        coin.x -= game.gameSpeed;
        coin.pulse += 0.15;

        // Draw animated Gold Coin
        const sizeOffset = Math.sin(coin.pulse) * 3;
        ctx.fillStyle = "#FFE600";
        ctx.beginPath();
        ctx.ellipse(
          coin.x + coin.width / 2,
          coin.y + coin.height / 2,
          (coin.width + sizeOffset) / 2,
          coin.height / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        // Highlight
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(coin.x + coin.width / 3, coin.y + coin.height / 4, 3, 5);

        // Check collection
        if (
          game.mario.x < coin.x + coin.width &&
          game.mario.x + game.mario.width > coin.x &&
          game.mario.y < coin.y + coin.height &&
          game.mario.y + game.mario.height > coin.y
        ) {
          playRetroSound("coin");
          game.coins.splice(i, 1);
          game.coinsCollected += 1;
          setCollectedCoins(game.coinsCollected);
          game.score += 50;
          setScore(game.score);

          // Update layout coin counter in real-time!
          const curCoins = Number(localStorage.getItem("admin_coins") || "0");
          localStorage.setItem("admin_coins", String(curCoins + 1));
          window.dispatchEvent(new Event("admin_coins_update"));

          // Spawns sparkles
          for (let p = 0; p < 6; p++) {
            game.particles.push({
              x: coin.x + coin.width / 2,
              y: coin.y + coin.height / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: "#FFE600",
              life: 25,
            });
          }
          continue;
        }

        if (coin.x + coin.width < 0) {
          game.coins.splice(i, 1);
        }
      }

      // ── PARTICLE EFFECTS ─────────────────────────────────────────────────────
      for (let i = game.particles.length - 1; i >= 0; i--) {
        const pt = game.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.1; // gravity
        pt.life--;

        ctx.fillStyle = pt.color;
        ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), 4, 4);

        if (pt.life <= 0) {
          game.particles.splice(i, 1);
        }
      }

      // Re-trigger loop
      animId = requestAnimationFrame(updateAndDraw);
    };

    if (gameState === "playing") {
      animId = requestAnimationFrame(updateAndDraw);
    } else {
      // Draw static menu/game over screens on canvas
      ctx.fillStyle = "#5c94fc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor
      ctx.fillStyle = "#fcb444";
      ctx.fillRect(0, 310, canvas.width, canvas.height - 310);
      ctx.fillStyle = "#9c4a00";
      ctx.fillRect(0, 310, canvas.width, 6);

      // Draw Mario standing still
      drawSprite(ctx, MARIO_SPRITE, 100, 266, 33, 44);

      if (gameState === "menu") {
        // Overlay banner
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(50, 40, canvas.width - 100, 160);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "24px 'Courier New', Courier, monospace";
        ctx.textAlign = "center";
        ctx.fillText("SUPER ADMIN MARIO", canvas.width / 2, 95);

        ctx.font = "14px 'Courier New', Courier, monospace";
        ctx.fillStyle = "#FFDD00";
        ctx.fillText("JUMP OVER PIPES AND DODGE GOOMBAS!", canvas.width / 2, 135);
        ctx.fillStyle = "#E0E0E0";
        ctx.fillText("Press SPACEBAR or CLICK to jump", canvas.width / 2, 165);
      } else if (gameState === "gameover") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(50, 40, canvas.width - 100, 200);

        ctx.fillStyle = "#FF3333";
        ctx.font = "28px 'Courier New', Courier, monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, 100);

        ctx.font = "14px 'Courier New', Courier, monospace";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`Final Score: ${stateRef.current.score}`, canvas.width / 2, 145);
        ctx.fillText(`Coins Collected: ${stateRef.current.coinsCollected}`, canvas.width / 2, 175);
        ctx.fillStyle = "#FFDD00";
        ctx.fillText("Click RESTART to try again!", canvas.width / 2, 210);
      }
    }

    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore, soundEnabled]);

  // Handle keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (gameState === "playing") {
          jump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  return (
    <AdminLayout activePage="arcade">
      <div className="p-8 space-y-6 max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-press-start font-extrabold text-white tracking-tight uppercase flex items-center justify-center gap-3">
            <Gamepad2 className="h-7 w-7 text-amber-400 animate-retro-float-small" />
            Super Mario Arcade
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg font-mono">
            A retro playground for Leads. Collect coins to boost your Admin Coin Counter! Syncs instantly in your sidebar.
          </p>
        </div>

        {/* Dashboard statistics row */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[800px] text-center font-press-start text-[9px]">
          <div className="p-4 bg-zinc-950 border-4 border-black rounded-2xl retro-shadow">
            <p className="text-zinc-550 mb-1">SCORE</p>
            <p className="text-white text-base font-extrabold">{score}</p>
          </div>
          <div className="p-4 bg-zinc-950 border-4 border-black rounded-2xl retro-shadow">
            <p className="text-zinc-550 mb-1">COINS</p>
            <p className="text-amber-400 text-base font-extrabold">🪙 {collectedCoins}</p>
          </div>
          <div className="p-4 bg-zinc-950 border-4 border-black rounded-2xl retro-shadow">
            <p className="text-zinc-550 mb-1">HI-SCORE</p>
            <p className="text-teal-400 text-base font-extrabold">{highScore}</p>
          </div>
        </div>

        {/* Arcade Cabinet Frame */}
        <div className="w-full max-w-[800px] border-8 border-amber-500 rounded-[24px] bg-black p-3 relative shadow-2xl retro-shadow-brown flex flex-col items-center overflow-hidden">
          {/* Neon Header banner */}
          <div className="w-full bg-zinc-900 border-4 border-black rounded-xl p-3 mb-3 flex items-center justify-between font-press-start text-[8px] tracking-wider text-white">
            <span className="text-rose-455 animate-pulse">● INSERT COIN</span>
            <span className="text-teal-400">1 PLAYER ONLY</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Game Canvas Container */}
          <div
            onClick={jump}
            className="w-full bg-black border-4 border-black rounded-lg cursor-pointer relative overflow-hidden select-none"
            style={{ aspectRatio: "2/1" }}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Game controller triggers */}
          {gameState !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-10 p-6">
              <div className="text-center space-y-6 max-w-sm">
                {gameState === "menu" ? (
                  <>
                    <h2 className="text-lg font-press-start text-white uppercase tracking-wider drop-shadow-[2px_2px_0px_#000]">
                      MARIO RUNNER
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                      Jump over pipes and incoming Goombas. Jump on top of Goombas to squash them! Collect gold coins to increment your sidebar coin count.
                    </p>
                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        startNewGame();
                      }}
                      className="w-full bg-amber-400 text-black border-4 border-black retro-shadow font-press-start text-xs font-bold hover:bg-amber-300 py-6 cursor-pointer"
                    >
                      <Play className="h-4 w-4 mr-2 fill-black" />
                      PLAY GAME
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-press-start text-rose-500 uppercase tracking-wider drop-shadow-[2px_2px_0px_#000]">
                      GAME OVER
                    </h2>
                    <div className="bg-zinc-900 border-4 border-black p-4 rounded-xl space-y-2 text-left font-press-start text-[9px] text-zinc-350">
                      <p>FINAL SCORE: <strong className="text-white">{score}</strong></p>
                      <p>COINS COLLECTED: <strong className="text-amber-400">🪙 {collectedCoins}</strong></p>
                      <p>HIGH SCORE: <strong className="text-teal-400">{highScore}</strong></p>
                    </div>
                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        startNewGame();
                      }}
                      className="w-full bg-amber-400 text-black border-4 border-black retro-shadow font-press-start text-xs font-bold hover:bg-amber-300 py-6 cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      PLAY AGAIN
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controller instructions */}
        <div className="w-full max-w-[800px] border-4 border-black bg-zinc-950 p-4 rounded-xl flex justify-between items-center gap-4 text-[10px] font-mono text-zinc-500 flex-wrap">
          <div>🎮 CONTROLS: <strong className="text-white">SPACEBAR / ARROW UP / W</strong> or <strong className="text-white">CLICK THE CANVAS</strong> to jump.</div>
          <div>🔈 SOUNDS: Click the speaker icon to toggle 8-bit audio synthetics.</div>
        </div>
      </div>
    </AdminLayout>
  );
}
