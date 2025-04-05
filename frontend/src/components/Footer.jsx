import React from 'react';
import '../styles/Footer.css';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/assets/logo.png" alt="MorphisTec" className="footer-logo" />
          <p>Tecnología a tu medida</p>
          <p>Resultados sin complicaciones.</p>

        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h4>Servicios</h4>
            <ul>
                <li>
                    <a href="#automatizacion" data-tooltip="Automatiza tareas repetitivas y ahorra tiempo con IA.">Automatización</a>
                </li>
                <li>
                    <a href="#ocr" data-tooltip="Extrae datos de PDFs o imágenes con OCR inteligente.">OCR Inteligente</a>
                </li>
                <li>
                    <a href="#ecommerce" data-tooltip="Crea una tienda online moderna, rápida y segura.">E-commerce</a>
                </li>
                <li>
                    <a href="#crm" data-tooltip="Gestiona clientes y analiza datos con dashboards a medida.">CRM & Dashboards</a>
                </li>
            </ul>
          </div>


          <div className="footer-column">
            <h4>Contáctanos</h4>
            <p>Email: <a href="mailto:hola@morphistec.com">hola@morphistec.com</a></p>
            <div className="social-icons">
              <a href="#"><Instagram size={20} /></a>
              <a href="#"><Linkedin size={20} /></a>
              <a href="mailto:hola@morphistec.com"><Mail size={20} /></a>
            </div>
          </div>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p>© 2025 MorphisTec. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="#">Política de privacidad</a>
          <a href="#">Términos y condiciones</a>
          <a href="#">Política de seguridad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
