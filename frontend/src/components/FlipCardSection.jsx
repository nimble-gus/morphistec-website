// FlipCardSection.jsx
import React from 'react';
import FlipCard from './FlipCard';

const FlipCardSection = () => {
  return (
    <div className="flip-card-container">
      <FlipCard
        frontText="¿Tus empleados siguen enviando reportes en Excel por correo?"
        backText="Con nuestra solución, automatizamos reportes en la nube en tiempo real."
      />
      <FlipCard
        frontText="¿Seguís atendiendo clientes por WhatsApp sin seguimiento?"
        backText="Te ayudamos a implementar un CRM para no perder oportunidades."
      />
      <FlipCard
        frontText="¿Tus datos están guardados en una USB?"
        backText="Migramos tu información a servidores seguros y accesibles."
      />
    </div>
  );
};

export default FlipCardSection;
