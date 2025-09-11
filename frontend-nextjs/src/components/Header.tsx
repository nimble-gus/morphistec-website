'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '../styles/Header.css';
import AppointmentModal from './AppointmentModal';

const Header: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
        <header className={`header ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
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
          <div className="nav-links">
            <div className="dropdown">
              <span className="dropdown-trigger">Servicios</span>
              <div className="dropdown-content">
                <Link href="/aplicaciones-moviles">Aplicaciones Móviles</Link>
                <Link href="/automatizacion">Automatización</Link>
                <Link href="/crm">CRM</Link>
                <Link href="/ecommerce">E-commerce</Link>
                <Link href="/ocr">OCR</Link>
                <Link href="/seguridad">Seguridad</Link>
              </div>
            </div>
            <div className="dropdown">
              <span className="dropdown-trigger">Legal</span>
              <div className="dropdown-content">
                <Link href="/terminos">Términos y Condiciones</Link>
                <Link href="/privacidad">Política de Privacidad</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-content">
            <div className="mobile-menu-section">
              <h3>Servicios</h3>
              <div className="mobile-menu-links">
                <Link href="/aplicaciones-moviles" onClick={() => setIsMobileMenuOpen(false)}>Aplicaciones Móviles</Link>
                <Link href="/automatizacion" onClick={() => setIsMobileMenuOpen(false)}>Automatización</Link>
                <Link href="/crm" onClick={() => setIsMobileMenuOpen(false)}>CRM</Link>
                <Link href="/ecommerce" onClick={() => setIsMobileMenuOpen(false)}>E-commerce</Link>
                <Link href="/ocr" onClick={() => setIsMobileMenuOpen(false)}>OCR</Link>
                <Link href="/seguridad" onClick={() => setIsMobileMenuOpen(false)}>Seguridad</Link>
              </div>
            </div>
            
            <div className="mobile-menu-section">
              <h3>Legal</h3>
              <div className="mobile-menu-links">
                <Link href="/terminos" onClick={() => setIsMobileMenuOpen(false)}>Términos y Condiciones</Link>
                <Link href="/privacidad" onClick={() => setIsMobileMenuOpen(false)}>Política de Privacidad</Link>
              </div>
            </div>

            <div className="mobile-menu-cta">
              <button className="mobile-cta-button" onClick={() => {
                setShowModal(true);
                setIsMobileMenuOpen(false);
              }}>
                Agenda una Cita
              </button>
            </div>
          </div>
        </div>

        <div className="header-right">
          {/* CTA Button for Desktop */}
          <button className="cta-button desktop-cta" onClick={() => setShowModal(true)}>
            <span>Agenda una Cita</span>
          </button>
          
          {/* Hamburger Menu Button for Mobile */}
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Modal de cita */}
      <AppointmentModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Header;
