import React, { useState } from 'react';
import '../styles/DigitalTest.css';

const questions = [
  "¿Sigues usando Excel como Base de Datos?", 
  "¿Tu equipo pasa días limpiando datos?", 
  "¿Digitas facturas manualmente?",
  "¿Tus reportes aún se hacen en Word?",
  "¿Sientes que necesitas tecnología?",
];


const DigitalTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer) => {
    if (answer === 'yes') setScore(score + 1);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const getResultMessage = () => {
    if (score >= 4) return { title: "🧱 pre-2005", detail: "necesitas urgente una renovación" };
    if (score >= 2) return { title: "🧪 En transición", detail: "vas por buen camino" };
    return { title: "🚀 Avanzado", detail: "pero siempre hay algo más que optimizar" };
  };

  return (
    <div className="digital-test">
      {!showResult ? (
        <div className="question-card">
          <h2>¿Qué tan digital es tu empresa?</h2>
          <p>{questions[currentQuestion]}</p>
          <div className="buttons">
            <button onClick={() => handleAnswer('yes')}>Sí</button>
            <button onClick={() => handleAnswer('no')}>No</button>
          </div>
        </div>
      ) : (
        <div className="result-card">
            <h2>
            Tu nivel de digitalización es:
            <br />
            <span className="result-highlight">
                {getResultMessage().title} <span className="result-detail">({getResultMessage().detail})</span>
            </span>
            </h2>
          <p>Descubre cómo podemos ayudarte.</p>
            <a
            href="https://wa.me/50254164264"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-link"
            >
            Conversemos por WhatsApp
            </a>        
        </div>
      )}
    </div>
  );
};

export default DigitalTest;
