"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
} from "react";

/** Igual que el snippet de 21st.dev: solo visor React + URL `.splinecode`. */
export interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineHostedViewer({ scene, className }: SplineSceneProps) {
  const src = `/spline-viewer.html?scene=${encodeURIComponent(scene)}`;
  return (
    <iframe
      title="Spline 3D"
      src={src}
      className={className}
      allow="xr-spatial-tracking; fullscreen"
      allowFullScreen
      loading="lazy"
      style={{ border: 0 }}
    />
  );
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-ok-ink">
          <span className="loader" aria-hidden />
        </div>
      }
    >
      <SplineHostedViewer scene={scene} className={className} />
    </Suspense>
  );
}

// --- Uso en producción (Apps a la medida): iframe opcional + boundary si falla el runtime ---

class SplineErrorBoundary extends Component<
  { className?: string; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SplineScene]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-3 bg-ok-ink px-4 text-center text-sm text-ok-mute ${this.props.className ?? ""}`}
        >
          <p className="max-w-[320px]">
            El visor 3D no pudo cargar el archivo. En Spline usa{" "}
            <span className="text-ok-text">Share → Embed</span> y pega esa URL en{" "}
            <code className="rounded bg-white/10 px-1 font-mono text-[10px]">
              spline-custom-apps-config.ts
            </code>{" "}
            (constante <span className="text-ok-text">SPLINE_CUSTOM_APPS_EMBED_URL</span>).
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function SplineEmbedIframe({ src, className }: { src: string; className?: string }) {
  return (
    <iframe
      title="Spline 3D"
      src={src}
      className={className}
      allow="xr-spatial-tracking; fullscreen"
      allowFullScreen
      loading="lazy"
      style={{ border: 0 }}
    />
  );
}

export interface SplineViewProps {
  /** Share → Embed en Spline (iframe). Si existe, tiene prioridad sobre `scene`. */
  embedUrl?: string;
  /** Export Code → React (URL `.splinecode`). */
  scene?: string;
  className?: string;
}

/** Para páginas: elige iframe o el componente tipo 21st.dev envuelto en error boundary. */
export function SplineView({ embedUrl, scene, className }: SplineViewProps) {
  const embed = embedUrl?.trim();
  if (embed) {
    return <SplineEmbedIframe src={embed} className={className} />;
  }

  const sceneUrl = scene?.trim() ?? "";
  if (!sceneUrl) {
    return null;
  }

  return (
    <SplineErrorBoundary key={sceneUrl} className={className}>
      <SplineScene scene={sceneUrl} className={className} />
    </SplineErrorBoundary>
  );
}

