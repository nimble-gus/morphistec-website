// FlipCard.jsx
import React from 'react';
import '../styles/FlipCard.css';

const FlipCard = ({ frontText, backText }) => {
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">{frontText}</div>
        <div className="flip-card-back">{backText}</div>
      </div>
    </div>
  );
};

export default FlipCard;
