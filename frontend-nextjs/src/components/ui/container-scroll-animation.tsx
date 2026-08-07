"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";

/**
 * Container Scroll Animation — Aceternity / Manu Arora
 * https://21st.dev/@manuarora700/components/container-scroll-animation
 *
 * Móvil: marco iPhone. md+: tablet landscape.
 */
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.45"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.97, 1] : [1.02, 1]);

  // En móvil menos rotateX: el foreshortening hace que el iPhone se vea achatado
  const rotate = useTransform(scrollYProgress, [0, 1], [isMobile ? 6 : 18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -8 : -28]);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col items-center justify-start px-3 pb-6 pt-8 sm:pt-10 md:px-6 md:pb-8 md:pt-12"
    >
      <div
        className="relative flex w-full max-w-6xl flex-col items-center"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="relative z-10 mx-auto mb-5 w-full max-w-5xl text-center sm:mb-6 md:mb-8"
    >
      {titleComponent}
    </motion.div>
  );
};

const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className={[
        "relative mx-auto overflow-hidden bg-[#0c0c0c]",
        // iPhone: ratio real (~9/19.5); el ancho baja si el alto del viewport es corto
        "h-auto w-[min(17.5rem,78vw,calc(84svh*9/19.5))] aspect-[9/19.5] max-h-[84svh] rounded-[2.6rem] border-[5px] border-[#2c2c2e] p-[5px]",
        // Tablet (md+)
        "md:aspect-auto md:h-[38rem] md:w-full md:max-w-5xl md:max-h-none md:rounded-[30px] md:border-4 md:border-[#6C6C6C] md:bg-[#222222] md:p-5",
      ].join(" ")}
    >
      {/* Dynamic Island — solo iPhone */}
      <div
        className="pointer-events-none absolute left-1/2 top-[11px] z-30 h-[1.75rem] w-[6.25rem] -translate-x-1/2 rounded-full bg-black md:hidden"
        aria-hidden
      />
      {/* Side buttons hint (iPhone) */}
      <div
        className="pointer-events-none absolute -left-[7px] top-[7.5rem] h-8 w-[3px] rounded-l-sm bg-[#3a3a3c] md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[7px] top-[10.5rem] h-12 w-[3px] rounded-l-sm bg-[#3a3a3c] md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-[7px] top-[14.25rem] h-12 w-[3px] rounded-l-sm bg-[#3a3a3c] md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[7px] top-[11rem] h-16 w-[3px] rounded-r-sm bg-[#3a3a3c] md:hidden"
        aria-hidden
      />

      <div className="relative h-full w-full overflow-hidden rounded-[2.25rem] bg-ok-ink md:rounded-2xl">
        {children}
        {/* Home indicator */}
        <div
          className="pointer-events-none absolute bottom-2 left-1/2 z-30 h-[4px] w-[7.5rem] -translate-x-1/2 rounded-full bg-white/35 md:hidden"
          aria-hidden
        />
      </div>
    </motion.div>
  );
};
