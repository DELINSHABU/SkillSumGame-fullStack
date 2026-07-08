import withSerwistInit from '@serwist/next';

// Serwist hooks the webpack build — `build` runs `next build --webpack`
// (Next 16 defaults to Turbopack). The SW is disabled in dev; to test it
// locally run a production build + `next start`.
const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @skillsum/shared is consumed as raw TypeScript (its `main` points at src/index.ts),
  // so Next must transpile it — required for `next build` on Vercel.
  transpilePackages: ['@skillsum/shared'],

  // Tree-shake recharts' barrel imports (it's dynamically imported in PracticeResults,
  // but this trims what does land in the chunk).
  experimental: {
    optimizePackageImports: ['recharts'],
  },

  // Proxy API calls to the Hono server — cookies stay same-origin, no CORS.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL ?? 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

export default withSerwist(nextConfig);
