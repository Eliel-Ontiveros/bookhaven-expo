import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para servidor API puro (sin interfaz web)
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // Deshabilitar optimizaciones de páginas ya que no tenemos interfaz
  images: {
    unoptimized: true,
  },

  // Configuración para optimizar builds de API y Socket.IO
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    serverComponentsExternalPackages: ["socket.io"]
  },

  // Webpack config para Socket.IO
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  // Headers de seguridad para API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // En producción, cambiar por dominios específicos
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'X-API-Server',
            value: 'BookHaven-API-v1.0.0',
          },
        ],
      },
    ];
  },

  // Redirecciones para cualquier ruta no-API
  async redirects() {
    return [
      {
        source: '/',
        destination: '/api',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;