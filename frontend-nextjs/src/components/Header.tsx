import React, { useState } from 'react';
import Link from 'next/link';
import '../styles/Header.css';
import AppointmentModal from './AppointmentModal';

interface HeaderProps {
  // Props removed - no longer needed
}

const Header: React.FC<HeaderProps> = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
        <header className="header">
        <div className="header-left">
            <Link href="/">
                <img src="/assets/logo.png" alt="MorphisTec logo" className="logo" />
            </Link>
        </div>

        <nav className="header-center">
            <button className="cta-button" onClick={() => setShowModal(true)}>
            <span>Agenda una Cita</span>
            </button>
        </nav>

        <div className="header-right">
          {/* Dark mode toggle removed */}
        </div>
      </header>

      {/* Modal de cita */}
      <AppointmentModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Header;
