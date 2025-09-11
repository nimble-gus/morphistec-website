import React, { useCallback, useState, useEffect } from 'react';                                                                                                            
import '../styles/Hero.css';
import WordCycler from './WordCycler';
import { useVideoControl } from '../hooks/useVideoControl';

interface HeroProps {
  className?: string;
  videoSrc?: string;
  fallbackImage?: string;
}

const Hero: React.FC<HeroProps> = ({ 
  className = '',
  videoSrc = '/assets/hero-video.mp4',
  fallbackImage = '/assets/hero-fallback.jpg'
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const videoRef = useVideoControl(videoSrc);

  // Intersection Observer para cargar video solo cuando esté visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [videoRef]);

  // Handlers del video optimizados
  const handleVideoLoadStart = useCallback(() => {
    // Video loading started
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setVideoError(true);
  }, []);

  const handleVideoLoadedData = useCallback(() => {
    // Video data loaded
  }, []);

  // Determinar qué mostrar como fondo - SIMPLIFIED for debugging
  const shouldShowVideo = true; // Always show video for now
  
  const backgroundStyle = videoError ? {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5) 10%, rgba(0,0,0,0.8) 100%), url(${fallbackImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <section 
      className={`hero-section ${className}`}
      style={backgroundStyle}
      aria-label="Hero section with dynamic text"
    >
      {shouldShowVideo && (
        <video 
          ref={videoRef}
          className={`hero-video ${isVideoLoaded ? 'loaded' : 'loading'}`}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          onLoadStart={handleVideoLoadStart}
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          onLoadedData={handleVideoLoadedData}
          aria-hidden="true"
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
          Tu navegador no soporta video HTML5.
        </video>
      )}
      
      {!videoError && <div className="video-overlay" />}

      <div className="hero-content left">
        <WordCycler />
      </div>

      {/* Loading indicator para el video */}
      {shouldShowVideo && !isVideoLoaded && (
        <div 
          className="video-loading"
          aria-label="Video cargando"
        >
          <div className="loading-spinner" />
        </div>
      )}

    </section>
  );
};

export default Hero;