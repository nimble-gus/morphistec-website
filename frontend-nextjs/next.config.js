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
      {
        source: '/favicon.png',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
        ],
      },
    ];
  },
  
  // Configuración experimental si es necesaria
  experimental: {
    // Habilitar si necesitas características experimentales
  },
  
  // Configuración de webpack para resolver problemas de módulos
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Configuración de compilación
  compiler: {
    // Eliminar console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración de optimización
  swcMinify: true,
};

module.exports = nextConfig;
