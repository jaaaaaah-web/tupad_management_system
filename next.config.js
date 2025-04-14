/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.fbcdn.net", // Allows all Facebook CDN images
      },
      {
        protocol: "https",
        hostname: "*.fna.fbcdn.net", // Allows all Facebook fna CDN images
      },
    ],
  },
  // Increase output compression for smaller bundle sizes
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Optional: Enable strict mode for better error catching
  reactStrictMode: true,
  // Configure for Vercel deployment
  output: 'standalone',

  // Disable ISR and static regeneration for all routes
  staticPageGenerationTimeout: 0,
  
  // Disable static optimizations to ensure pages are always server-rendered
  unstable_includeFiles: ['**/*.js'],
  
  // Disable Next.js cache for all routes
  onDemandEntries: {
    // Keep the ISR cache live for a short time
    maxInactiveAge: 5 * 1000, // 5 seconds
    // Only cache 1 page
    pagesBufferLength: 1,
  },

  // Important: Configure routes to prevent static rendering of dynamic content
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Disable page data caching
    isrMemoryCacheSize: 0,
    // Disable fetch cache in development and production
    fetchCache: false,
  },

  // Skip static generation for dynamic routes
  generateBuildId: async () => {
    return 'build-' + new Date().getTime();
  },
  
  webpack: (config, { isServer }) => {
    // Add fallbacks for node modules not available in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
      url: false,
      net: false,
      tls: false,
      zlib: false,
      http: false,
      https: false,
      child_process: false,
      encoding: false,
    };

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
