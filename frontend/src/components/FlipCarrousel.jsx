import React from 'react';
import Slider from 'react-slick';
import FlipCard from './FlipCard';
import '../styles/FlipCard.css'; // si no lo importás global

const FlipCarousel = () => {
  const cards = [
    {
      front: '¿Seguís usando Excel como CRM?',
      back: 'Te instalamos un CRM moderno en la nube.',
    },
    {
      front: '¿Digitás facturas manualmente?',
      back: 'Automatizamos el ingreso con OCR e IA.',
    },
    {
      front: '¿Tu base de datos vive en una USB?',
      back: 'La migramos a un servidor seguro y accesible.',
    },
    {
      front: '¿Validás identidad solo con DPI escaneado?',
      back: 'Integrá verificación con IA y biometría.',
    },
        { front: '¿Seguís usando Excel como CRM?', back: 'Te instalamos un CRM moderno en la nube.' },
        { front: '¿Digitás facturas manualmente?', back: 'Automatizamos con OCR e IA.' },
        { front: '¿Tu base de datos vive en una USB?', back: 'La migramos a un servidor seguro.' },
        { front: '¿Validás identidad con DPI escaneado?', back: 'Usá IA y biometría.' },
        { front: '¿Tus reportes se hacen en Word?', back: 'Automatizalos con dashboards en tiempo real.' },
      ];
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 5, // 👈 Muestra 3 tarjetas
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };
  

  return (
    <section className="flip-carousel-section">
      <h2 className="carousel-title">¿Alguno de estos problemas te parece familiar?</h2>
      <Slider {...settings}>
        {cards.map((card, i) => (
          <FlipCard key={i} frontText={card.front} backText={card.back} />
        ))}
      </Slider>
    </section>
  );
};

export default FlipCarousel;
