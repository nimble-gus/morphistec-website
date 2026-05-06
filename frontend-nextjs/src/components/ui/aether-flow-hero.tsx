"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type AetherFlowHeroProps = {
  className?: string;
};

/**
 * Fondo de partículas con canvas (reemplazo visual del WireGlobe).
 * El copy del hero vive en `Hero`; este componente solo pinta la animación.
 */
export default function AetherFlowHero({ className }: AetherFlowHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    const container = containerRef.current;
    if (!canvasNode || !container) return;
    const canvas: HTMLCanvasElement = canvasNode;

    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    let animationFrameId = 0;
    let particles: Particle[] = [];
    const mouse = { x: null as number | null, y: null as number | null, radius: 200 };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(
        x: number,
        y: number,
        directionX: number,
        directionY: number,
        size: number,
        color: string
      ) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius + this.size && dist > 0) {
            const forceDirectionX = dx / dist;
            const forceDirectionY = dy / dist;
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= forceDirectionX * force * 5;
            this.y -= forceDirectionY * force * 5;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init() {
      particles = [];
      const n = (canvas.height * canvas.width) / 9000;
      const numberOfParticles = Math.max(40, Math.floor(n));
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const margin = size * 2;
        const x = Math.random() * (canvas.width - margin * 2) + margin;
        const y = Math.random() * (canvas.height - margin * 2) + margin;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;
        const color = "rgba(255, 255, 255, 0.82)";
        particles.push(new Particle(x, y, directionX, directionY, size, color));
      }
    }

    const resizeCanvas = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = w;
      canvas.height = h;
      init();
    };

    const connect = () => {
      const threshold = (canvas.width / 7) * (canvas.height / 7);
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const distSq =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

          if (distSq < threshold) {
            const opacityValue = 1 - distSq / 20000;

            let stroke = `rgba(255, 255, 255, ${opacityValue})`;
            if (mouse.x !== null && mouse.y !== null) {
              const dx_mouse_a = particles[a].x - mouse.x;
              const dy_mouse_a = particles[a].y - mouse.y;
              const distance_mouse_a = Math.sqrt(dx_mouse_a * dx_mouse_a + dy_mouse_a * dy_mouse_a);
              if (distance_mouse_a < mouse.radius) {
                stroke = `rgba(255, 255, 255, ${opacityValue})`;
              }
            }

            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(container);
    resizeCanvas();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    animate();

    return () => {
      ro.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full min-h-[280px] overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
        aria-hidden
      />
    </div>
  );
}
