"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Retraso en segundos dentro del stagger del viewport */
  delay?: number;
  /** Desplazamiento vertical inicial (px) */
  y?: number;
} & Omit<HTMLMotionProps<"div">, "children" | "initial" | "animate" | "whileInView">;

/**
 * Reveal al entrar en viewport (estilo Altus: fade + rise, una sola vez).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  ...rest
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16, margin: "0px 0px -6% 0px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
