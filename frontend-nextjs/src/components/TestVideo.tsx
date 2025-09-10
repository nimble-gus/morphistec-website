'use client';

import React from 'react';

const TestVideo: React.FC = () => {
  console.log('TestVideo component is rendering!');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1, // Z-index bajo para estar detrás del contenido
      backgroundColor: 'transparent' // Transparente para que se vea el video
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        onLoadStart={() => console.log('TEST: Video loading started')}
        onCanPlay={() => console.log('TEST: Video can play')}
        onError={(e) => console.log('TEST: Video error:', e)}
        onLoadedData={() => console.log('TEST: Video data loaded')}
        onPlay={() => console.log('TEST: Video is playing')}
      >
        <source src="/assets/bkgrnd.mp4" type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>
    </div>
  );
};

export default TestVideo;
