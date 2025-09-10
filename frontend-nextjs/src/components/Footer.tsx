import React from 'react';
import Link from 'next/link';
import '../styles/Footer.css';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/assets/logo.png" alt="Oktae.tech" className="footer-logo" />
          <p>Tecnología a tu medida</p>
          <p>Resultados sin complicaciones.</p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h4>Servicios</h4>
            <ul>
              <li>
                <Link href="/automatizacion" data-tooltip="Automatiza tareas repetitivas y ahorra tiempo con IA.">Automatización</Link>
              </li>
              <li>
                <Link href="/ocr" data-tooltip="Extrae datos de PDFs o imágenes con OCR inteligente.">OCR Inteligente</Link>
              </li>
              <li>
                <Link href="/ecommerce" data-tooltip="Crea una tienda online moderna, rápida y segura.">E-commerce</Link>
              </li>
              <li>
                <Link href="/crm" data-tooltip="Gestiona clientes y analiza datos con dashboards a medida.">CRM & Dashboards</Link>
              </li>
              <li>
                <Link href="/centralizacion" data-tooltip="Unifica tus fuentes de datos para decisiones más inteligentes.">Centralización de Datos</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contáctanos</h4>
            <p>Email: <a href="mailto:hola@oktae.tech">hola@oktae.tech</a></p>
            <div className="social-icons">
              <a
                href="https://www.instagram.com/oktae.tech/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/morphistec/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:hola@oktae.tech"
                aria-label="Enviar correo"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p>© 2025 Oktae.tech. Todos los derechos reservados.</p>
        <div className="footer-links">
          <Link href="/privacidad">Política de privacidad</Link>
          <Link href="/terminos">Términos y condiciones</Link>
          <Link href="/seguridad">Política de seguridad</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
