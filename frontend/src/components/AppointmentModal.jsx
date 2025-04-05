import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/AppointmentModal.css';

const AppointmentModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    correo: '',
    fecha: '',
    hora: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const message = `
      Nombre: ${formData.nombre}
      Empresa: ${formData.empresa}
      Teléfono: ${formData.telefono}
      Correo: ${formData.correo}
      Fecha: ${formData.fecha}
      Hora: ${formData.hora}
    `;

    try {
      await fetch('https://formsubmit.co/ajax/hola@morphistec.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      Swal.fire({
        title: '¡Gracias por agendar!',
        text: 'En breve uno de nuestros agentes se comunicará contigo para coordinar una videollamada.',
        icon: 'success',
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#00d36b',
        confirmButtonText: 'Aceptar',
      });

      setFormData({
        nombre: '',
        empresa: '',
        telefono: '',
        correo: '',
        fecha: '',
        hora: '',
      });

      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Ocurrió un problema al enviar la cita. Intenta nuevamente.',
        confirmButtonText: 'Cerrar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <h2>Agendar una Cita</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="nombre" placeholder="Nombre" required value={formData.nombre} onChange={handleChange} />
          <input type="text" name="empresa" placeholder="Empresa" required value={formData.empresa} onChange={handleChange} />
          <input type="tel" name="telefono" placeholder="Teléfono" required value={formData.telefono} onChange={handleChange} />
          <input type="email" name="correo" placeholder="Correo" required value={formData.correo} onChange={handleChange} />

          <label className="input-label" htmlFor="fecha">Seleccione una fecha</label>
          <input type="date" name="fecha" id="fecha" required value={formData.fecha} onChange={handleChange} />

          <label className="input-label" htmlFor="hora">Seleccione una hora</label>
          <input type="time" name="hora" id="hora" required value={formData.hora} onChange={handleChange} />

          <div className="modal-buttons">
            <button type="submit" className="confirm" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Agendar'}
            </button>
            <button type="button" onClick={onClose} className="cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
