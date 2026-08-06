"use client";

import { cn } from "@/lib/utils";

type MenuToggleIconProps = {
  open: boolean;
  className?: string;
  duration?: number;
};

/** Animated hamburger → close icon for mobile nav. */
export function MenuToggleIcon({
  open,
  className,
  duration = 300,
}: MenuToggleIconProps) {
  const transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

  return (
    <span className={cn("relative inline-flex size-5 items-center justify-center", className)} aria-hidden>
      <span
        className="absolute h-[1.5px] w-4 rounded-full bg-current"
        style={{
          transition,
          transform: open ? "translateY(0) rotate(45deg)" : "translateY(-4px)",
        }}
      />
      <span
        className="absolute h-[1.5px] w-4 rounded-full bg-current"
        style={{
          transition,
          opacity: open ? 0 : 1,
          transform: open ? "scaleX(0)" : "scaleX(1)",
        }}
      />
      <span
        className="absolute h-[1.5px] w-4 rounded-full bg-current"
        style={{
          transition,
          transform: open ? "translateY(0) rotate(-45deg)" : "translateY(4px)",
        }}
      />
    </span>
  );
}
