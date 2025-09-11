import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '../styles/Header.css';
import AppointmentModal from './AppointmentModal';

const Header: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
        <header className="header">
        <div className="header-left">
            <Link href="/">
                <Image 
                  src="/assets/logo.png" 
                  alt="Oktae.tech logo" 
                  width={120} 
                  height={40} 
                  className="logo"
                  style={{ width: 'auto', height: 'auto' }}
                />
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
