import React from 'react';
import '../styles/Hero.css';
import WordCycler from './WordCycler';
import { useVideoControl } from '../hooks/useVideoControl';

const Hero: React.FC = () => {
  const videoRef = useVideoControl('/assets/hero-video.mp4');

  return (
    <section className="hero-section">
      <video 
        ref={videoRef}
        className="hero-video" 
        autoPlay 
        loop 
        muted 
        playsInline
        preload="metadata"
        onLoadStart={() => console.log('Hero video loading started')}
        onCanPlay={() => console.log('Hero video can play')}
        onError={(e) => console.log('Hero video error:', e)}
        onLoadedData={() => console.log('Hero video data loaded')}
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>
      <div className="video-overlay" />

      <div className="hero-content left">
        <WordCycler />
      </div>
    </section>
  );
};

export default Hero;
