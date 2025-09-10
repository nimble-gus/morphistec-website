import React, { useState, useEffect } from 'react';
import '../styles/Hero.css';

const words = ['Technology', 'Your Extra Power', 'Innovation', 'Efficiency', 'What you need'];

const WordCycler: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    let fadeTimeout: NodeJS.Timeout, cycleTimeout: NodeJS.Timeout;
    
    const animate = () => {
      setFade(false);
      fadeTimeout = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % words.length);
        setFade(true);
        cycleTimeout = setTimeout(animate, 2500);
      }, 500);
    };

    const initTimeout = setTimeout(animate, 2500);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(cycleTimeout);
      clearTimeout(initTimeout);
    };
  }, []);

  return (
<p className="hero-dynamic">
    <span className="static-text">Oktae is: </span>
    <span className={`hero-word ${fade ? 'fade-in' : ''}`}>{words[current]}</span>
</p>

  );
};

export default WordCycler;
