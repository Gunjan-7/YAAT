/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize image loading
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
      },
    ],
    // Optimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize production builds
  swcMinify: true,
  compiler: {
    // Remove console logs in production but keep errors and warnings
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize page loading
  poweredByHeader: false,
  // Optimize memory usage
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  experimental: {
    optimizeCss: true,
    // Optimize bundle size by only importing used components
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'framer-motion',
    ]
  },
}

export default nextConfig
