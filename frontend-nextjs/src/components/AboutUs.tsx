import React from 'react';
import Image from 'next/image';
import '../styles/AboutUs.css';

const AboutUs: React.FC = () => {
  return (
    <section className="about-section" id="nosotros">
      <div className="about-container">
        <div className="about-text">
        <h2>¿Quiénes Somos?</h2>
        <p>
  En <strong>Oktae.tech</strong> ayudamos a empresas sin equipo de tecnología interno a transformar sus operaciones con soluciones hechas a la medida.
</p>
<p>
  Creamos software, automatizaciones e interfaces inteligentes que agilizan procesos, centralizan datos y convierten problemas en oportunidades.
</p>

        </div>

        <div className="about-image">
          <Image src="/assets/about-us.jpg" alt="Equipo Oktae.tech" width={400} height={300} />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
