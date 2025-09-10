'use client';

import React, { useState } from 'react';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import WhyMorphisTec from '@/components/WhyMorphisTec';
import HowWeDoIt from '@/components/HowWeDoIt';
import Footer from '@/components/Footer';
import AboutUs from '@/components/AboutUs';
import DigitalTest from '@/components/DigitalTest';
import Image from 'next/image';

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <>
      <div className={`invert-wrapper ${!darkMode ? 'light-mode' : ''}`}>
        <Header setDarkMode={setDarkMode} darkMode={darkMode} />
        <Hero />
        <WhyMorphisTec />
        <AboutUs />
        <HowWeDoIt />
        <DigitalTest />
        <Footer />
      </div>

      {/* Botón fuera del wrapper para que NO lo afecte el filter */}
      <div className="whatsapp-wrapper">
        <a
          href="https://wa.me/50254164264"
          className="whatsapp-float"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
        >
          <Image src="/assets/whatsapp-icon.svg" alt="WhatsApp" width={60} height={60} />
        </a>
      </div>
    </>
  );
}
