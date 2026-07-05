/** @type {import('next').NextConfig} */
const nextConfig = {
  // @skillsum/shared is consumed as raw TypeScript (its `main` points at src/index.ts),
  // so Next must transpile it — required for `next build` on Vercel.
  transpilePackages: ['@skillsum/shared'],

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

export default nextConfig;
