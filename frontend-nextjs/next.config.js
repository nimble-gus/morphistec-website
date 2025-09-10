/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para compatibilidad con react-slick
  transpilePackages: ['react-slick'],
  
  // Configuración de imágenes
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
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
    ];
  },
  
  // Configuración experimental si es necesaria
  experimental: {
    // Habilitar si necesitas características experimentales
  },
};

module.exports = nextConfig;
