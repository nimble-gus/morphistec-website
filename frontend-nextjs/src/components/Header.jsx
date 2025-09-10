import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import AppointmentModal from './AppointmentModal';

const Header = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  return (
    <>
        <header className="header">
        <div className="header-left">
            <img src="/assets/logo.png" alt="MorphisTec logo" className="logo" />
        </div>

        <nav className="header-center">
            <button className="cta-button" onClick={() => setShowModal(true)}>
            <span>Agenda una Cita</span>
            </button>
        </nav>

        <div className="header-right">

          <button className="darkmode-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Cambiar modo oscuro">
            
            {darkMode ? (
              // Sol (modo claro)
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" height="24" width="24">
                <path d="M15 2h2v5h-2Z" fill="white" />
                <path transform="rotate(-45 24.147 7.853)" d="M21.6675 6.8536h4.958v1.9998h-4.958Z" fill="white" />
                <path d="M25 15h5v2h-5Z" fill="white" />
                <path transform="rotate(-45 24.147 24.146)" d="M23.1466 21.6675h1.9998v4.958h-1.9998Z" fill="white" />
                <path d="M15 25h2v5h-2Z" fill="white" />
                <path transform="rotate(-45 7.853 24.146)" d="M5.3745 23.1466h4.958v1.9998h-4.958Z" fill="white" />
                <path d="M2 15h5v2H2Z" fill="white" />
                <path transform="rotate(-45 7.854 7.853)" d="M6.8536 5.3745h1.9998v4.958H6.8536Z" fill="white" />
                <path d="M16 12a4 4 0 1 1-4 4 4.0045 4.0045 0 0 1 4-4m0-2a6 6 0 1 0 6 6 6 6 0 0 0-6-6Z" fill="white" />
              </svg>
            ) : (
              // Luna (modo oscuro)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" height="24" width="24">
                <path
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M8 7c0.0047-1.2124 0.3242-2.4027 0.9272-3.4545S10.3961 1.6166 11.44 1C10.6659 0.6795 9.8378 0.5098 9 0.5c-1.7239 0-3.3772 0.6848-4.5962 1.9038C3.1848 3.6228 2.5 5.2761 2.5 7s0.6848 3.3772 1.9038 4.5962C5.6228 12.8152 7.2761 13.5 9 13.5c0.8479-0.006 1.6866-0.1758 2.47-0.5-1.0495-0.6128-1.9213-1.4883-2.5297-2.5404C8.3318 9.4076 8.0078 8.2153 8 7z"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Modal de cita */}
      <AppointmentModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Header;
