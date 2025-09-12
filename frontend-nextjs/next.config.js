/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para compatibilidad con react-slick
  transpilePackages: ['react-slick'],
  
  // Configuración de imágenes
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configuración de rewrites para favicon
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/faviconoktae.png',
      },
      {
        source: '/app.ico',
        destination: '/faviconoktae.png',
      },
    ];
  },
  
  // Configuración de headers para archivos estáticos
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/faviconoktae.png',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Configuración de compilación
  compiler: {
    // Eliminar console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
