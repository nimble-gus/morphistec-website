import React from 'react';
import '../styles/Hero.css';
import WordCycler from './WordCycler';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="video-overlay" />
      <video className="hero-video" autoPlay loop muted playsInline>
        <source src="./assets/hero-video.mp4" type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>

      <div className="hero-content left">
        <WordCycler />
      </div>
    </section>
  );
};

export default Hero;
