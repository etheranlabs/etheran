/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Required for viem/wagmi in server components
  experimental: {
    serverComponentsExternalPackages: ['viem'],
  },
}

export default nextConfig
