"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";

type Cell = {
  /** posición actual (desplazada) */
  x: number;
  y: number;
  /** posición en reposo */
  ox: number;
  oy: number;
  col: number;
  row: number;
};

type Ripple = { x: number; y: number; r: number; max: number; life: number };

type KineticGridProps = {
  children?: ReactNode;
  className?: string;
  /** Espacio entre nodos (px). */
  spacing?: number;
  /** Color base líneas/puntos */
  lineColor?: string;
  /** Color acento cerca del cursor (cian/indigo claro) */
  accentColor?: string;
};

/**
 * Kinetic Grid estilo 21st/@satoriui:
 * retícula de líneas + puntos en cruces; se “pellizca” hacia el cursor
 * y brilla en el área de atracción; ripples al clic.
 * @see https://21st.dev/@satoriui/components/kinetic-grid
 */
export default function KineticGrid({
  children,
  className,
  spacing = 32,
  lineColor = "rgba(160, 170, 190, 0.22)",
  accentColor = "rgba(120, 180, 255, 0.95)",
}: KineticGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<{
    cols: number;
    rows: number;
    cells: Cell[];
  }>({ cols: 0, rows: 0, cells: [] });
  const ripplesRef = useRef<Ripple[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 1, h: 1 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rebuild = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(width));
      const h = Math.max(1, Math.floor(height));
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // padding para que la grilla empiece un poco fuera y no se vea el borde
      const pad = spacing * 0.5;
      const cols = Math.ceil((w + pad * 2) / spacing) + 1;
      const rows = Math.ceil((h + pad * 2) / spacing) + 1;
      const cells: Cell[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ox = -pad + col * spacing;
          const oy = -pad + row * spacing;
          cells.push({ x: ox, y: oy, ox, oy, col, row });
        }
      }
      gridRef.current = { cols, rows, cells };
    };

    rebuild();
    const ro = new ResizeObserver(rebuild);
    ro.observe(wrap);

    const idx = (col: number, row: number, cols: number) => row * cols + col;

    const tick = () => {
      const { w, h } = sizeRef.current;
      const { cols, rows, cells } = gridRef.current;
      const ptr = pointerRef.current;
      const ripples = ripplesRef.current;

      // radio de atracción (pellizco)
      const pullR = 170;
      const pullStrength = 0.42; // 0..1 cuánto se mueve al cursor

      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]!;
        let tx = c.ox;
        let ty = c.oy;

        if (ptr.active) {
          const dx = c.ox - ptr.x;
          const dy = c.oy - ptr.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist < pullR) {
            // falloff suave (más fuerte en el centro → efecto “sink”)
            const t = 1 - dist / pullR;
            const falloff = t * t * (3 - 2 * t); // smoothstep
            tx = c.ox + (ptr.x - c.ox) * falloff * pullStrength;
            ty = c.oy + (ptr.y - c.oy) * falloff * pullStrength;
          }
        }

        // ripples: desplazamiento radial
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r]!;
          const dx = c.ox - rip.x;
          const dy = c.oy - rip.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const band = Math.abs(dist - rip.r);
          if (band < 36) {
            const wave = (1 - band / 36) * rip.life * 14;
            tx += (dx / dist) * wave;
            ty += (dy / dist) * wave;
          }
        }

        c.x += (tx - c.x) * 0.28;
        c.y += (ty - c.y) * 0.28;
      }

      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r]!;
        rip.r += 5;
        rip.life *= 0.96;
        if (rip.life < 0.035 || rip.r > rip.max) ripples.splice(r, 1);
      }

      ctx.clearRect(0, 0, w, h);

      // --- líneas horizontales ---
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const a = cells[idx(col, row, cols)]!;
          const b = cells[idx(col + 1, row, cols)]!;
          drawSegment(ctx, a, b, ptr, pullR, lineColor, accentColor);
        }
      }

      // --- líneas verticales ---
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows - 1; row++) {
          const a = cells[idx(col, row, cols)]!;
          const b = cells[idx(col, row + 1, cols)]!;
          drawSegment(ctx, a, b, ptr, pullR, lineColor, accentColor);
        }
      }

      // --- puntos en nodos ---
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]!;
        const heat = nodeHeat(c, ptr, pullR, ripples);
        const r = 1.15 + heat * 1.6;
        const alpha = 0.35 + heat * 0.65;
        ctx.beginPath();
        ctx.fillStyle = heat > 0.08 ? mixAlpha(accentColor, alpha) : mixAlpha(lineColor, alpha + 0.15);
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (heat > 0.35) {
          ctx.beginPath();
          ctx.fillStyle = mixAlpha(accentColor, heat * 0.25);
          ctx.arc(c.x, c.y, r * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [spacing, lineColor, accentColor]);

  const onPointerMove = (e: ReactPointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const onPointerLeave = () => {
    pointerRef.current.active = false;
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerRef.current = { x, y, active: true };
    ripplesRef.current.push({
      x,
      y,
      r: 0,
      max: Math.max(rect.width, rect.height) * 0.9,
      life: 1,
    });
  };

  return (
    <div
      ref={wrapRef}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          // Soft edge at bottom so the grid doesn't hard-cut into the next section
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%)",
        }}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function nodeHeat(
  c: Cell,
  ptr: { x: number; y: number; active: boolean },
  pullR: number,
  ripples: Ripple[]
) {
  let heat = 0;
  if (ptr.active) {
    const dist = Math.hypot(c.ox - ptr.x, c.oy - ptr.y);
    if (dist < pullR) {
      const t = 1 - dist / pullR;
      heat = Math.max(heat, t * t);
    }
  }
  for (const rip of ripples) {
    const dist = Math.hypot(c.ox - rip.x, c.oy - rip.y);
    const band = Math.abs(dist - rip.r);
    if (band < 40) {
      heat = Math.max(heat, (1 - band / 40) * rip.life * 0.85);
    }
  }
  return Math.min(1, heat);
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  a: Cell,
  b: Cell,
  ptr: { x: number; y: number; active: boolean },
  pullR: number,
  lineColor: string,
  accentColor: string
) {
  const midX = (a.ox + b.ox) / 2;
  const midY = (a.oy + b.oy) / 2;
  let heat = 0;
  if (ptr.active) {
    const dist = Math.hypot(midX - ptr.x, midY - ptr.y);
    if (dist < pullR) {
      const t = 1 - dist / pullR;
      heat = t * t;
    }
  }
  const w = 0.7 + heat * 1.1;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle =
    heat > 0.05
      ? mixAlpha(accentColor, 0.15 + heat * 0.75)
      : lineColor;
  ctx.lineWidth = w;
  ctx.stroke();
}

/** Aplica alpha a un color rgba(...) o hex-ish simple */
function mixAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const m = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/
  );
  if (m) {
    return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})`;
  }
  return color;
}
