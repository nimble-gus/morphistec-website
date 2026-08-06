import Image from "next/image";

export function OktaeMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="4" fill="var(--ok-neon)" />
    </svg>
  );
}

/** Altura del logo en px; la anchura sigue la proporción del PNG. */
export function OktaeLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo1.png"
      alt="Oktae"
      width={320}
      height={96}
      priority
      className={`w-auto max-w-full object-contain object-left brightness-0 invert ${className}`.trim()}
      style={className.includes("h-") || className.includes("h-[") ? undefined : { height: size }}
      sizes={`${Math.ceil(size * 4)}px`}
    />
  );
}
