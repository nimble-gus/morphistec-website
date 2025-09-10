'use client';

import React from 'react';

const SimpleTest: React.FC = () => {
  console.log('SimpleTest component is rendering!');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      backgroundColor: 'lime', // Verde brillante para que sea imposible no verlo
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px',
      color: 'black',
      fontWeight: 'bold'
    }}>
      ¡TEST FUNCIONANDO!
    </div>
  );
};

export default SimpleTest;

