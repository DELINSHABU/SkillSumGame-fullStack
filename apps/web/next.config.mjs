/** @type {import('next').NextConfig} */
const nextConfig = {
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
