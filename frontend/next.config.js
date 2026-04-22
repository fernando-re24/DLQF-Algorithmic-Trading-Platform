/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) return [];
    return [{ source: '/api/:path*', destination: `${base}/:path*` }];
  },
};

module.exports = nextConfig;
