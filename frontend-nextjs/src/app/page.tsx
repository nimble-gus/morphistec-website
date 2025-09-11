'use client';

import React from 'react';
import Hero from '@/components/Hero';
import WhyMorphisTec from '@/components/WhyMorphisTec';
import AboutUs from '@/components/AboutUs';
import HowWeDoIt from '@/components/HowWeDoIt';
import DigitalTest from '@/components/DigitalTest';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import '../styles/MainPage.css';

export default function Home() {
  return (
    <main className="main-page">
      <Hero />
      <WhyMorphisTec />
      <AboutUs />
      <HowWeDoIt />
      <DigitalTest />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}