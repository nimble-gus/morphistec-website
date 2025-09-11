'use client';

import React, { useRef, useEffect } from 'react';
import '../styles/BackgroundVideo.css';

const BackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Forzar la reproducción del video
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          video.load();
        }
      };
      
      // Esperar a que el video esté listo
      video.addEventListener('loadeddata', playVideo);
      
      return () => {
        video.removeEventListener('loadeddata', playVideo);
      };
    }
  }, []);

  return (
    <div className="background-video-container">
      <video
        ref={videoRef}
        className="background-video"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onLoadStart={() => {}}
        onCanPlay={() => {}}
        onError={() => {}}
        onLoadedData={() => {}}
      >
        <source src="/assets/bkgrnd.mp4" type="video/mp4" />
        Tu navegador no soporta video HTML5.
      </video>
      <div className="video-overlay" />
    </div>
  );
};

export default BackgroundVideo;
