import React, { useState, useEffect } from 'react';
import '../styles/Hero.css';

const words = ['Technology', 'Change', 'Innovation', 'Efficiency', 'What you need'];

const WordCycler = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    let fadeTimeout, cycleTimeout, initTimeout;

    const animate = () => {
      setFade(false);
      fadeTimeout = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % words.length);
        setFade(true);
        cycleTimeout = setTimeout(animate, 2500);
      }, 500);
    };

    initTimeout = setTimeout(animate, 2500);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(cycleTimeout);
      clearTimeout(initTimeout);
    };
  }, []);

  return (
<p className="hero-dynamic">
  <span className="static-text">Morph is:</span><br />
  <span className={`hero-word ${fade ? 'fade-in' : ''}`}>{words[current]}</span>
</p>

  );
};

export default WordCycler;
