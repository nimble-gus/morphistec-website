import React from 'react';
import Image from 'next/image';
import '../styles/WhatsAppFloat.css';

const WhatsAppFloat: React.FC = () => {
  return (
    <a
      href="https://wa.me/50254164264"
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <Image 
        src="/assets/whatsapp-icon.svg" 
        alt="WhatsApp" 
        width={28} 
        height={28}
        priority
      />
    </a>
  );
};

export default WhatsAppFloat;

