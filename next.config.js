/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.quran.com' },
      { protocol: 'https', hostname: '**.mp3quran.net' }
    ]
  }
};

module.exports = nextConfig;
