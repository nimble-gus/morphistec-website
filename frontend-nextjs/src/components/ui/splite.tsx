"use client";

import { Suspense, lazy, useCallback } from "react";
import type { Application } from "@splinetool/runtime";
import { cn } from "@/lib/utils";

const Spline = lazy(() => import("@splinetool/react-spline"));

export type SplineSceneProps = {
  scene: string;
  className?: string;
  /**
   * Si es true (default), el follow del mouse usa eventos de `window`
   * y el robot sigue el cursor aunque salgas del contenedor.
   * API Spline: Application.setGlobalEvents(true).
   */
  trackGlobalMouse?: boolean;
};

/**
 * Spline Scene (21st.dev / @serafimcloud/splite)
 * Lazy-load de @splinetool/react-spline.
 * @see https://21st.dev/@serafimcloud/components/splite
 */
export function SplineScene({
  scene,
  className,
  trackGlobalMouse = true,
}: SplineSceneProps) {
  const onLoad = useCallback(
    (app: Application) => {
      if (trackGlobalMouse) {
        app.setGlobalEvents(true);
      }
      // Fondo del canvas transparente → se ve el shader de Nosotros
      try {
        app.setBackgroundColor("transparent");
      } catch {
        try {
          app.setBackgroundColor("rgba(0,0,0,0)");
        } catch {
          /* escena sin API de fondo */
        }
      }
      if (app.canvas) {
        app.canvas.style.background = "transparent";
      }
    },
    [trackGlobalMouse]
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[240px] w-full items-center justify-center bg-ok-ink/50">
          <span className="loader" aria-hidden />
        </div>
      }
    >
      <Spline
        scene={scene}
        className={cn("h-full w-full", className)}
        onLoad={onLoad}
      />
    </Suspense>
  );
}
