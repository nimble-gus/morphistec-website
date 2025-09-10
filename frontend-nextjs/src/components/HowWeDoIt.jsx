import React from 'react';
import '../styles/HowWeDoIt.css';
import { Search, Puzzle, Rocket } from 'lucide-react'; // si usás Lucide

const HowWeDoIt = () => {
  return (
    <section className="how-section">
      <h2 className="section-title">¿Cómo lo hacemos?</h2>
      <div className="steps-container">
        <div className="step-card">
          <div className="icon"><Search size={32} /></div>
          <h3>Análisis inicial</h3>
          <p>Identificamos y analizamos las necesidades tecnológicas actuales de tu negocio.</p>
        </div>
        <div className="step-card">
          <div className="icon"><Puzzle size={32} /></div>
          <h3>Diseño de solución</h3>
          <p>Te presentamos un plan personalizado, adaptado a tus objetivos específicos.</p>
        </div>
        <div className="step-card">
          <div className="icon"><Rocket size={32} /></div>
          <h3>Implementación</h3>
          <p>Implementamos soluciones efectivas con soporte continuo y escalable.</p>
        </div>
      </div>
    </section>
  );
};

export default HowWeDoIt;
