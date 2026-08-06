"use client";

import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  /** Color del haze (CSS color) */
  fill?: string;
};

/**
 * Spotlight sutil (Aceternity / 21st hero pattern).
 * Usado junto al bloque Spline.
 */
export function Spotlight({
  className,
  fill = "white",
}: SpotlightProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-[1] h-[500px] w-[500px] rounded-full opacity-30 blur-3xl md:h-[640px] md:w-[640px]",
        className
      )}
      style={{
        background: `radial-gradient(circle at center, ${fill} 0%, transparent 68%)`,
      }}
    />
  );
}
