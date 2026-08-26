const rawTarget =
  process.env.API_PROXY_TARGET ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://dubicolt-v2.ambitiousrock-1ff861ef.eastus.azurecontainerapps.io';
const apiTarget = rawTarget.replace(/\/api\/?$/, '');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
