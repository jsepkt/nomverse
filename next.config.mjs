/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents duplicate Phaser canvas instantiation in dev mode
  webpack: (config) => {
    // Enable raw markdown importing if needed
    return config;
  },
};

export default nextConfig;
