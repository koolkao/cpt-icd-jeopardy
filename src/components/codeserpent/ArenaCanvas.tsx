"use client";

import { useRef, useEffect, useCallback } from "react";
import type { SnakeState, CodePill, ArenaEvent, Direction } from "@/data/types";

const CELL_SIZE = 20;
const PLAYER_CELL_SIZE = 25;
const GRID_W = 60;
const GRID_H = 40;
const CANVAS_W = GRID_W * CELL_SIZE;
const CANVAS_H = GRID_H * CELL_SIZE;

// Player viewport size (fits ~375px phone portrait)
const PLAYER_CANVAS_W = 375;
const PLAYER_CANVAS_H = 550;

// Minimap dimensions
const MINIMAP_W = 80;
const MINIMAP_H = Math.round(MINIMAP_W * (GRID_H / GRID_W));
const MINIMAP_MARGIN = 8;

// Camera snap threshold — stop lerping below this distance (px)
const CAMERA_SNAP_THRESHOLD = 0.5;

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

export interface TickSnapshot {
  heads: Map<string, { x: number; y: number; direction: Direction }>;
  snakes: SnakeState[];
  pills: CodePill[];
  timeRemainingS: number;
}

export function emptySnapshot(): TickSnapshot {
  return { heads: new Map(), snakes: [], pills: [], timeRemainingS: 0 };
}

export interface ArenaDebugStats {
  tickIntervals: number[];   // last N raw intervals between ticks (ms)
  tAtArrival: number[];      // last N tickProgress values when new tick arrived
  tickDuration: number;      // current smoothed duration
  frameMs: number;           // last frame delta
}

export interface ArenaStateRef {
  from: TickSnapshot;
  to: TickSnapshot;
  interpStart: number;
  tickDuration: number;  // smoothed estimate of inter-tick interval (ms)
  round: number;
  totalRounds: number;
  scenarioText: string;
  events: ArenaEvent[];
  debug: ArenaDebugStats;
}

interface ArenaCanvasProps {
  stateRef: React.MutableRefObject<ArenaStateRef>;
  myPlayerId?: string;
  showHUD?: boolean;
  cameraFollow?: boolean;
  showMinimap?: boolean;
  showDebug?: boolean;
}

export default function ArenaCanvas({
  stateRef,
  myPlayerId,
  showHUD = true,
  cameraFollow = false,
  showMinimap = false,
  showDebug = false,
}: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastFrameRef = useRef<number>(0);

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
    const now = performance.now();
    const wallClock = Date.now(); // for invincibility flash (server uses Date.now())
    const t = Math.min((now - state.interpStart) / state.tickDuration, 1);
    // Ease-out quadratic: head decelerates to zero velocity at t=1,
    // making the brief pause before the next tick imperceptible
    const tickProgress = 1 - (1 - t) * (1 - t);

    // Delta time for frame-rate independent camera lerp
    const rawDt = lastFrameRef.current ? now - lastFrameRef.current : 16;
    const dt = Math.min(rawDt, 50);
    lastFrameRef.current = now;
    const lerpFactor = 1 - Math.exp(-8 * dt / 1000);
    state.debug.frameMs = rawDt;

    // Process events for particles (fewer in player mode)
    const particleCount = cameraFollow ? 4 : 8;
    for (const evt of state.events) {
      if (evt.type === "collect_correct") {
        spawnParticles(evt.x, evt.y, "#22c55e", particleCount);
      } else if (evt.type === "collect_wrong") {
        spawnParticles(evt.x, evt.y, "#ef4444", particleCount);
      } else if (evt.type === "collision" || evt.type === "wall_hit") {
        spawnParticles(evt.x, evt.y, "#f59e0b", cameraFollow ? 6 : 12);
      }
    }
    state.events = [];

    // Camera-follow: compute viewport offset
    let camOffsetX = 0;
    let camOffsetY = 0;
    if (cameraFollow && myPlayerId) {
      const toHead = state.to.heads.get(myPlayerId);
      const fromHead = state.from.heads.get(myPlayerId);
      if (toHead) {
        const headX = fromHead
          ? fromHead.x + (toHead.x - fromHead.x) * tickProgress
          : toHead.x;
        const headY = fromHead
          ? fromHead.y + (toHead.y - fromHead.y) * tickProgress
          : toHead.y;
        const targetX = headX * cellSize + cellSize / 2 - canvasW / 2;
        const targetY = headY * cellSize + cellSize / 2 - canvasH / 2;

        const dx = targetX - cameraRef.current.x;
        const dy = targetY - cameraRef.current.y;

        if (Math.abs(dx) < CAMERA_SNAP_THRESHOLD && Math.abs(dy) < CAMERA_SNAP_THRESHOLD) {
          cameraRef.current.x = targetX;
          cameraRef.current.y = targetY;
        } else {
          cameraRef.current.x += dx * lerpFactor;
          cameraRef.current.y += dy * lerpFactor;
        }
      }

      camOffsetX = Math.round(Math.max(0, Math.min(arenaW - canvasW, cameraRef.current.x)));
      camOffsetY = Math.round(Math.max(0, Math.min(arenaH - canvasH, cameraRef.current.y)));
    }

    // Visible cell range for viewport culling (with 1-cell padding)
    const visMinCellX = cameraFollow ? Math.max(0, Math.floor(camOffsetX / cellSize) - 1) : 0;
    const visMaxCellX = cameraFollow ? Math.min(GRID_W, Math.ceil((camOffsetX + canvasW) / cellSize) + 1) : GRID_W;
    const visMinCellY = cameraFollow ? Math.max(0, Math.floor(camOffsetY / cellSize) - 1) : 0;
    const visMaxCellY = cameraFollow ? Math.min(GRID_H, Math.ceil((camOffsetY + canvasH) / cellSize) + 1) : GRID_H;

    // Clear
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Apply camera transform
    ctx.save();
    if (cameraFollow) {
      ctx.translate(-camOffsetX, -camOffsetY);
    }

    // Grid lines — skip entirely in player mode (barely visible, expensive)
    if (!cameraFollow) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= GRID_W; x++) {
        const px = x * cellSize;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, arenaH);
      }
      for (let y = 0; y <= GRID_H; y++) {
        const py = y * cellSize;
        ctx.moveTo(0, py);
        ctx.lineTo(arenaW, py);
      }
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = "rgba(255, 204, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, arenaW, arenaH);

    // Draw pills — cull to visible viewport, use fillRect instead of roundRect in player mode
    const pillFontSize = cameraFollow ? 10 : 7;
    ctx.font = `bold ${pillFontSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const pill of state.to.pills) {
      if (cameraFollow && (pill.x < visMinCellX || pill.x > visMaxCellX || pill.y < visMinCellY || pill.y > visMaxCellY)) continue;
      const px = pill.x * cellSize;
      const py = pill.y * cellSize;

      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      if (cameraFollow) {
        ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
      } else {
        ctx.beginPath();
        ctx.roundRect(px + 1, py + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText(pill.code, px + cellSize / 2, py + cellSize / 2);
    }

    // Draw snakes — use fillRect for body in player mode, skip per-segment alpha
    const eyeSize = cameraFollow ? 4 : 3;
    const eyeOffset = cameraFollow ? 8 : 6;
    const pupilRadius = cameraFollow ? 2 : 1.5;
    const pupilShift = cameraFollow ? 2 : 1.5;
    for (const snake of state.to.snakes) {
      if (!snake.alive || snake.segments.length === 0) continue;

      const isMe = snake.playerId === myPlayerId;
      const isInvincible = snake.invincibleUntil > wallClock;
      const alpha = isInvincible ? 0.5 + 0.3 * Math.sin(wallClock / 100) : 1;

      for (let i = snake.segments.length - 1; i >= 0; i--) {
        const seg = snake.segments[i];

        if (i === 0) {
          // Head — ease-out interpolation between from/to snapshots
          const fromHead = state.from.heads.get(snake.playerId);
          const toHead = state.to.heads.get(snake.playerId);
          const tx = toHead ? toHead.x : seg.x;
          const ty = toHead ? toHead.y : seg.y;
          let drawX: number;
          let drawY: number;
          if (fromHead) {
            drawX = (fromHead.x + (tx - fromHead.x) * tickProgress) * cellSize;
            drawY = (fromHead.y + (ty - fromHead.y) * tickProgress) * cellSize;
          } else {
            drawX = tx * cellSize;
            drawY = ty * cellSize;
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = snake.color;
          if (cameraFollow) {
            ctx.fillRect(drawX + 1, drawY + 1, cellSize - 2, cellSize - 2);
          } else {
            ctx.beginPath();
            ctx.roundRect(drawX + 1, drawY + 1, cellSize - 2, cellSize - 2, 6);
            ctx.fill();
          }

          // Eyes
          ctx.fillStyle = "white";
          if (snake.direction === "up" || snake.direction === "down") {
            ctx.fillRect(drawX + eyeOffset - eyeSize, drawY + cellSize / 2 - eyeSize, eyeSize * 2, eyeSize * 2);
            ctx.fillRect(drawX + cellSize - eyeOffset - eyeSize, drawY + cellSize / 2 - eyeSize, eyeSize * 2, eyeSize * 2);
          } else {
            ctx.fillRect(drawX + cellSize / 2 - eyeSize, drawY + eyeOffset - eyeSize, eyeSize * 2, eyeSize * 2);
            ctx.fillRect(drawX + cellSize / 2 - eyeSize, drawY + cellSize - eyeOffset - eyeSize, eyeSize * 2, eyeSize * 2);
          }
          // Pupils
          ctx.fillStyle = "#111";
          const pdx = snake.direction === "left" ? -pupilShift : snake.direction === "right" ? pupilShift : 0;
          const pdy = snake.direction === "up" ? -pupilShift : snake.direction === "down" ? pupilShift : 0;
          if (snake.direction === "up" || snake.direction === "down") {
            ctx.fillRect(drawX + eyeOffset + pdx - pupilRadius, drawY + cellSize / 2 + pdy - pupilRadius, pupilRadius * 2, pupilRadius * 2);
            ctx.fillRect(drawX + cellSize - eyeOffset + pdx - pupilRadius, drawY + cellSize / 2 + pdy - pupilRadius, pupilRadius * 2, pupilRadius * 2);
          } else {
            ctx.fillRect(drawX + cellSize / 2 + pdx - pupilRadius, drawY + eyeOffset + pdy - pupilRadius, pupilRadius * 2, pupilRadius * 2);
            ctx.fillRect(drawX + cellSize / 2 + pdx - pupilRadius, drawY + cellSize - eyeOffset + pdy - pupilRadius, pupilRadius * 2, pupilRadius * 2);
          }

          // Name label above head
          ctx.globalAlpha = 1;
          ctx.fillStyle = isMe ? "#FFCC00" : "rgba(255,255,255,0.7)";
          ctx.font = isMe
            ? `bold ${cameraFollow ? 12 : 10}px sans-serif`
            : `${cameraFollow ? 11 : 9}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(snake.playerName, drawX + cellSize / 2, drawY - 4);

          // Reset font for pills
          ctx.font = `bold ${pillFontSize}px monospace`;
          ctx.textBaseline = "middle";
        } else {
          // Body — cull off-screen segments, use fillRect in player mode, uniform alpha
          if (cameraFollow && (seg.x < visMinCellX || seg.x > visMaxCellX || seg.y < visMinCellY || seg.y > visMaxCellY)) continue;
          const sx = seg.x * cellSize;
          const sy = seg.y * cellSize;
          if (cameraFollow) {
            // Uniform alpha for body in player mode (skip per-segment globalAlpha changes)
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = snake.color;
            ctx.fillRect(sx + 2, sy + 2, cellSize - 4, cellSize - 4);
          } else {
            ctx.globalAlpha = alpha * (0.6 + 0.4 * (1 - i / snake.segments.length));
            ctx.fillStyle = snake.color;
            ctx.beginPath();
            ctx.roundRect(sx + 2, sy + 2, cellSize - 4, cellSize - 4, 4);
            ctx.fill();
          }
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
      p.life -= 0.04;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      const sz = p.size * p.life;
      ctx.fillRect(p.x - sz, p.y - sz, sz * 2, sz * 2);
    }
    ctx.globalAlpha = 1;

    // Restore transform before drawing HUD (HUD drawn in screen-space)
    ctx.restore();

    // HUD overlay (drawn in screen/canvas coordinates, not world coordinates)
    if (showHUD) {
      // Timer bar at top
      const timerFraction = state.to.timeRemainingS / 60;
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
      ctx.fillStyle = state.to.timeRemainingS <= 10 ? "#ef4444" : "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${state.to.timeRemainingS}s`, canvasW - 8, 23);

      // Mini scoreboard (top-center) — host only (skip in cameraFollow mode)
      if (!cameraFollow) {
        const sorted = [...state.to.snakes]
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
      for (const pill of state.to.pills) {
        ctx.fillRect(mmX + pill.x * cellW, mmY + pill.y * cellH, Math.max(1, cellW), Math.max(1, cellH));
      }

      // Snakes as colored dots (use interpolated heads from to snapshot)
      for (const [playerId, head] of state.to.heads) {
        const snake = state.to.snakes.find((s) => s.playerId === playerId);
        if (!snake || !snake.alive) continue;
        const isMe = playerId === myPlayerId;
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

    // Debug overlay
    if (showDebug) {
      const dbg = state.debug;
      const intervals = dbg.tickIntervals;
      const arrivals = dbg.tAtArrival;
      const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
      const minInterval = intervals.length > 0 ? Math.min(...intervals) : 0;
      const maxInterval = intervals.length > 0 ? Math.max(...intervals) : 0;
      const avgT = arrivals.length > 0 ? arrivals.reduce((a, b) => a + b, 0) / arrivals.length : 0;
      const minT = arrivals.length > 0 ? Math.min(...arrivals) : 0;
      const maxT = arrivals.length > 0 ? Math.max(...arrivals) : 0;

      const lines = [
        `frm ${dbg.frameMs.toFixed(1)}ms`,
        `dur ${dbg.tickDuration.toFixed(0)}ms`,
        `int ${avgInterval.toFixed(0)}[${minInterval.toFixed(0)}-${maxInterval.toFixed(0)}]`,
        `t@a ${avgT.toFixed(2)}[${minT.toFixed(2)}-${maxT.toFixed(2)}]`,
        `t=${t.toFixed(2)} e=${tickProgress.toFixed(2)}`,
      ];
      const lineH = 16;
      const boxH = lines.length * lineH + 8;
      const boxW = 190;
      const boxX = 4;
      const boxY = 34;

      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = "#0f0";
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = "#0f0";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + 4, boxY + 4 + i * lineH);
      });
      ctx.textBaseline = "middle"; // restore
    }

    rafRef.current = requestAnimationFrame(render);
  }, [stateRef, myPlayerId, showHUD, spawnParticles, cameraFollow, showMinimap, showDebug, cellSize, canvasW, canvasH, arenaW, arenaH]);

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
