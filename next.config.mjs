/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // PocketBase file storage (Aadhaar images, profile photos, etc.)
      { protocol: 'http', hostname: '127.0.0.1', port: '8090' },
      { protocol: 'https', hostname: '**.pockethost.io' },
      // Add your production PocketBase / CDN domain here before deploying, e.g.:
      // { protocol: 'https', hostname: 'api.urbanserve.in' },
    ],
  },
  async headers() {
    return [
      {
        // Private dashboards should never be cached or indexed by proxies
        source: '/(dashboard|earnings|onboarding|notifications)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
