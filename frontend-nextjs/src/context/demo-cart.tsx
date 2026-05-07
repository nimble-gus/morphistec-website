"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DemoCartContextValue = {
  itemCount: number;
  cartVisible: boolean;
  /** Primer clic en la tarjeta E-commerce: muestra carrito (1) sin sumar más después. */
  activateEcommerceDemo: () => void;
  /** Checkout: oculta carrito, confetti. */
  completeEcommerceCheckout: () => void;
};

const DemoCartContext = createContext<DemoCartContextValue | null>(null);

type ConfettiFn = (opts?: Record<string, unknown>) => void;
let confettiLoader: Promise<ConfettiFn | null> | null = null;

async function loadConfetti(): Promise<ConfettiFn | null> {
  if (!confettiLoader) {
    confettiLoader = import("canvas-confetti")
      .then(({ default: confetti }) => confetti as ConfettiFn)
      .catch((error: unknown) => {
        // En dev con HMR puede fallar un chunk viejo; evitamos romper la UI.
        console.warn("[DemoCart] No se pudo cargar canvas-confetti.", error);
        return null;
      });
  }
  return confettiLoader;
}

async function runConfettiBurst() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const confetti = await loadConfetti();
  if (!confetti) return;

  const burst = () => {
    confetti({
      particleCount: 95,
      spread: 68,
      origin: { y: 0.72 },
      colors: ["#b8ff2e", "#ffffff", "#2b6bff", "#ededed"],
    });
  };
  burst();
  window.setTimeout(burst, 220);
  window.setTimeout(burst, 440);
}

export function DemoCartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  const activateEcommerceDemo = useCallback(() => {
    setItemCount(1);
  }, []);

  const completeEcommerceCheckout = useCallback(() => {
    setItemCount(0);
    runConfettiBurst();
  }, []);

  const value = useMemo(
    () => ({
      itemCount,
      cartVisible: itemCount > 0,
      activateEcommerceDemo,
      completeEcommerceCheckout,
    }),
    [itemCount, activateEcommerceDemo, completeEcommerceCheckout],
  );

  return (
    <DemoCartContext.Provider value={value}>{children}</DemoCartContext.Provider>
  );
}

export function useDemoCart() {
  const ctx = useContext(DemoCartContext);
  if (!ctx) {
    throw new Error("useDemoCart must be used within DemoCartProvider");
  }
  return ctx;
}
