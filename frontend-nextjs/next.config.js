const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Repo padre tiene otro package-lock; fija el tracing a esta app Next.
  outputFileTracingRoot: path.join(__dirname),
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
};

module.exports = nextConfig;
