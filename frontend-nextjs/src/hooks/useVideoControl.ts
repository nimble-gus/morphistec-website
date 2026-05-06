import { useRef, useEffect } from 'react';

/**
 * @param enabled — Si es false, no se carga ni reproduce (p. ej. hero fuera de vista o reduced motion).
 * Debe incluirse en las dependencias cuando el <video> se monta condicionalmente.
 */
export const useVideoControl = (videoSrc: string, enabled = true) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    let isMounted = true;

    const playVideo = async () => {
      if (!isMounted || !video) return;

      try {
        video.currentTime = 0;
        await video.play();
      } catch {
        setTimeout(() => {
          if (isMounted && video) {
            video.load();
          }
        }, 100);
      }
    };

    const handleLoadedData = () => {
      if (isMounted) {
        playVideo();
      }
    };

    const handleVisibilityChange = () => {
      if (isMounted && video) {
        if (document.hidden) {
          video.pause();
        } else {
          playVideo();
        }
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    video.load();

    return () => {
      isMounted = false;
      video.pause();
      video.removeEventListener('loadeddata', handleLoadedData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [videoSrc, enabled]);

  return videoRef;
};


