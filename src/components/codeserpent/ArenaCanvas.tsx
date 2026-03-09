"use client";

import { useRef, useEffect, useCallback } from "react";
import type { SnakeState, CodePill, ArenaEvent } from "@/data/types";

const CELL_SIZE = 20;
const PLAYER_CELL_SIZE = 25;
const GRID_W = 60;
const GRID_H = 40;
const CANVAS_W = GRID_W * CELL_SIZE;
const CANVAS_H = GRID_H * CELL_SIZE;

// Player viewport size (fits ~375px phone portrait)
const PLAYER_CANVAS_W = 375;
const PLAYER_CANVAS_H = 550;
const CAMERA_LERP_SPEED = 0.15;

// Minimap dimensions
const MINIMAP_W = 80;
const MINIMAP_H = Math.round(MINIMAP_W * (GRID_H / GRID_W));
const MINIMAP_MARGIN = 8;

// Particle effect for collections
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface ArenaStateRef {
  snakes: SnakeState[];
  pills: CodePill[];
  timeRemainingS: number;
  round: number;
  totalRounds: number;
  scenarioText: string;
  events: ArenaEvent[];
  lastTickTime: number;
  prevSnakeHeads: Map<string, { x: number; y: number }>;
}

interface ArenaCanvasProps {
  stateRef: React.MutableRefObject<ArenaStateRef>;
  myPlayerId?: string;
  showHUD?: boolean;
  cameraFollow?: boolean;
  showMinimap?: boolean;
}

export default function ArenaCanvas({
  stateRef,
  myPlayerId,
  showHUD = true,
  cameraFollow = false,
  showMinimap = false,
}: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const cellSize = cameraFollow ? PLAYER_CELL_SIZE : CELL_SIZE;
  const canvasW = cameraFollow ? PLAYER_CANVAS_W : CANVAS_W;
  const canvasH = cameraFollow ? PLAYER_CANVAS_H : CANVAS_H;
  const arenaW = GRID_W * cellSize;
  const arenaH = GRID_H * cellSize;

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x * cellSize + cellSize / 2,
        y: y * cellSize + cellSize / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, [cellSize]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    const now = Date.now();
    const tickProgress = Math.min(1, (now - state.lastTickTime) / 100);

    // Process events for particles
    for (const evt of state.events) {
      if (evt.type === "collect_correct") {
        spawnParticles(evt.x, evt.y, "#22c55e", 8);
      } else if (evt.type === "collect_wrong") {
        spawnParticles(evt.x, evt.y, "#ef4444", 8);
      } else if (evt.type === "collision" || evt.type === "wall_hit") {
        spawnParticles(evt.x, evt.y, "#f59e0b", 12);
      }
    }
    state.events = [];

    // Camera-follow: compute viewport offset
    let camOffsetX = 0;
    let camOffsetY = 0;
    if (cameraFollow && myPlayerId) {
      const mySnake = state.snakes.find((s) => s.playerId === myPlayerId);
      if (mySnake && mySnake.segments.length > 0) {
        const head = mySnake.segments[0];
        const targetX = head.x * cellSize + cellSize / 2 - canvasW / 2;
        const targetY = head.y * cellSize + cellSize / 2 - canvasH / 2;

        // Lerp camera toward target
        cameraRef.current.x += (targetX - cameraRef.current.x) * CAMERA_LERP_SPEED;
        cameraRef.current.y += (targetY - cameraRef.current.y) * CAMERA_LERP_SPEED;
      }

      // Clamp to arena bounds
      camOffsetX = Math.max(0, Math.min(arenaW - canvasW, cameraRef.current.x));
      camOffsetY = Math.max(0, Math.min(arenaH - canvasH, cameraRef.current.y));
    }

    // Clear
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Apply camera transform
    ctx.save();
    if (cameraFollow) {
      ctx.translate(-camOffsetX, -camOffsetY);
    }

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, arenaH);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(arenaW, y * cellSize);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = "rgba(255, 204, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, arenaW, arenaH);

    // Draw pills
    const pillFontSize = cameraFollow ? 10 : 7;
    for (const pill of state.pills) {
      const px = pill.x * cellSize;
      const py = pill.y * cellSize;

      // Capsule shape
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(px + 1, py + 1, cellSize - 2, cellSize - 2, 4);
      ctx.fill();

      // Code text
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = `bold ${pillFontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pill.code, px + cellSize / 2, py + cellSize / 2);
    }

    // Draw snakes
    const eyeSize = cameraFollow ? 4 : 3;
    const eyeOffset = cameraFollow ? 8 : 6;
    const pupilRadius = cameraFollow ? 2 : 1.5;
    const pupilShift = cameraFollow ? 2 : 1.5;
    for (const snake of state.snakes) {
      if (!snake.alive || snake.segments.length === 0) continue;

      const isMe = snake.playerId === myPlayerId;
      const isInvincible = snake.invincibleUntil > now;
      const alpha = isInvincible ? 0.5 + 0.3 * Math.sin(now / 100) : 1;

      // Body segments
      for (let i = snake.segments.length - 1; i >= 0; i--) {
        const seg = snake.segments[i];
        const sx = seg.x * cellSize;
        const sy = seg.y * cellSize;

        if (i === 0) {
          // Head — interpolate position
          const prevHead = state.prevSnakeHeads.get(snake.playerId);
          let drawX = sx;
          let drawY = sy;
          if (prevHead) {
            drawX = (prevHead.x * cellSize) + (sx - prevHead.x * cellSize) * tickProgress;
            drawY = (prevHead.y * cellSize) + (sy - prevHead.y * cellSize) * tickProgress;
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = snake.color;
          ctx.beginPath();
          ctx.roundRect(drawX + 1, drawY + 1, cellSize - 2, cellSize - 2, 6);
          ctx.fill();

          // Eyes
          ctx.fillStyle = "white";
          if (snake.direction === "up" || snake.direction === "down") {
            ctx.beginPath();
            ctx.arc(drawX + eyeOffset, drawY + cellSize / 2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(drawX + cellSize - eyeOffset, drawY + cellSize / 2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(drawX + cellSize / 2, drawY + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(drawX + cellSize / 2, drawY + cellSize - eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
          }
          // Pupils
          ctx.fillStyle = "#111";
          const pdx = snake.direction === "left" ? -pupilShift : snake.direction === "right" ? pupilShift : 0;
          const pdy = snake.direction === "up" ? -pupilShift : snake.direction === "down" ? pupilShift : 0;
          if (snake.direction === "up" || snake.direction === "down") {
            ctx.beginPath();
            ctx.arc(drawX + eyeOffset + pdx, drawY + cellSize / 2 + pdy, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(drawX + cellSize - eyeOffset + pdx, drawY + cellSize / 2 + pdy, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(drawX + cellSize / 2 + pdx, drawY + eyeOffset + pdy, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(drawX + cellSize / 2 + pdx, drawY + cellSize - eyeOffset + pdy, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Name label above head
          ctx.globalAlpha = 1;
          ctx.fillStyle = isMe ? "#FFCC00" : "rgba(255,255,255,0.7)";
          ctx.font = isMe
            ? `bold ${cameraFollow ? 12 : 10}px sans-serif`
            : `${cameraFollow ? 11 : 9}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(snake.playerName, drawX + cellSize / 2, drawY - 4);
        } else {
          // Body
          ctx.globalAlpha = alpha * (0.6 + 0.4 * (1 - i / snake.segments.length));
          ctx.fillStyle = snake.color;
          ctx.beginPath();
          ctx.roundRect(sx + 2, sy + 2, cellSize - 4, cellSize - 4, 4);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Restore transform before drawing HUD (HUD drawn in screen-space)
    ctx.restore();

    // HUD overlay (drawn in screen/canvas coordinates, not world coordinates)
    if (showHUD) {
      // Timer bar at top
      const timerFraction = state.timeRemainingS / 60;
      const barWidth = canvasW * timerFraction;
      ctx.fillStyle = timerFraction > 0.5 ? "#22c55e" : timerFraction > 0.2 ? "#f59e0b" : "#ef4444";
      ctx.fillRect(0, 0, barWidth, 4);

      // Round indicator (top-left)
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 6, 120, 24);
      ctx.fillStyle = "#FFCC00";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Round ${state.round}/${state.totalRounds}`, 8, 22);

      // Time (top-right)
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(canvasW - 60, 6, 60, 24);
      ctx.fillStyle = state.timeRemainingS <= 10 ? "#ef4444" : "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${state.timeRemainingS}s`, canvasW - 8, 23);

      // Mini scoreboard (top-center) — host only (skip in cameraFollow mode)
      if (!cameraFollow) {
        const sorted = [...state.snakes]
          .filter((s) => s.alive || s.segments.length > 0 || s.score !== 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        if (sorted.length > 0) {
          const sbWidth = Math.min(sorted.length * 100, canvasW - 200);
          const sbX = (canvasW - sbWidth) / 2;
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(sbX, 6, sbWidth, 20);
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          const spacing = sbWidth / sorted.length;
          sorted.forEach((s, i) => {
            const x = sbX + spacing * i + spacing / 2;
            ctx.fillStyle = s.playerId === myPlayerId ? "#FFCC00" : s.color;
            ctx.fillText(`${s.playerName}: ${s.score}`, x, 19);
          });
        }
      }
    }

    // Minimap (player mode only)
    if (showMinimap && cameraFollow) {
      const mmX = MINIMAP_MARGIN;
      const mmY = canvasH - MINIMAP_H - MINIMAP_MARGIN;
      const cellW = MINIMAP_W / GRID_W;
      const cellH = MINIMAP_H / GRID_H;

      // Background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(mmX, mmY, MINIMAP_W, MINIMAP_H);
      ctx.strokeStyle = "rgba(255, 204, 0, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(mmX, mmY, MINIMAP_W, MINIMAP_H);

      // Pills as small dots
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      for (const pill of state.pills) {
        ctx.fillRect(mmX + pill.x * cellW, mmY + pill.y * cellH, Math.max(1, cellW), Math.max(1, cellH));
      }

      // Snakes as colored dots
      for (const snake of state.snakes) {
        if (!snake.alive || snake.segments.length === 0) continue;
        const head = snake.segments[0];
        const isMe = snake.playerId === myPlayerId;
        ctx.fillStyle = isMe ? "#FFCC00" : snake.color;
        const dotSize = isMe ? 3 : 2;
        ctx.beginPath();
        ctx.arc(mmX + head.x * cellW + cellW / 2, mmY + head.y * cellH + cellH / 2, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Viewport rectangle
      const vpX = mmX + (camOffsetX / arenaW) * MINIMAP_W;
      const vpY = mmY + (camOffsetY / arenaH) * MINIMAP_H;
      const vpW = (canvasW / arenaW) * MINIMAP_W;
      const vpH = (canvasH / arenaH) * MINIMAP_H;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(vpX, vpY, vpW, vpH);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [stateRef, myPlayerId, showHUD, spawnParticles, cameraFollow, showMinimap, cellSize, canvasW, canvasH, arenaW, arenaH]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasW}
      height={canvasH}
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
