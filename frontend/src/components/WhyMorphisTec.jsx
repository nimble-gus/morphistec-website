import React, { useEffect, useRef, useState } from 'react';
import '../styles/WhyMorphisTec.css';

const phrases = [
  'Deepfake detection se volvió esencial en 2023… ¿y vos validás identidad solo por DPI escaneado?',
  'En plena pandemia, empresas migraron en días a la nube… ¿y vos aún dependés del servidor de la oficina?',
  'SQL existe desde 1974… ¿y todavía usás Excel como base de datos?',
  'La automatización con IA ya es cotidiana… ¿y tu facturación sigue siendo manual?',
  'El OCR existe desde los 70… ¿y vos digitás datos a mano desde PDFs?',
  'Los CRM existen hace décadas… ¿y gestionás clientes con Post-its?',
  'La IA ya clasifica documentos automáticamente… ¿y vos seguís ordenando carpetas a mano?',
  'El OCR moderno extrae texto en segundos… ¿y vos escribís los datos desde PDFs?'
];

const WhyMorphisTec = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true); // Solo se activa, nunca se desactiva
          observer.disconnect(); // Desconectamos el observer después de activarse una vez
        }
      },
      { threshold: 0.6 } // Más permisivo para móviles
    );
  
    const currentSection = sectionRef.current;
    if (currentSection) observer.observe(currentSection);
  
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let interval;
    if (visible) {
      interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % phrases.length);
          setFade(true);
        }, 500);
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <section ref={sectionRef} className={`why-section ${visible ? 'active' : ''}`}>
      <div className={`tech-fact ${fade ? 'fade-in' : 'fade-out'}`}>
        {visible && phrases[index]}
      </div>
    </section>
  );
};

export default WhyMorphisTec;
