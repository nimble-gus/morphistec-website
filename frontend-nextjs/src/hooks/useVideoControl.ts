import { useRef, useEffect } from 'react';

export const useVideoControl = (videoSrc: string) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    const playVideo = async () => {
      if (!isMounted || !video) return;
      
      try {
        // Reset video state
        video.currentTime = 0;
        await video.play();
        console.log('Video playing successfully:', videoSrc);
      } catch (error) {
        console.log('Video autoplay failed:', error);
        // Retry after a short delay
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

    // Event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial load
    video.load();

    return () => {
      isMounted = false;
      video.removeEventListener('loadeddata', handleLoadedData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [videoSrc]);

  return videoRef;
};
