const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.OKTAE_BUILD_DIR || ".next",
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Repo padre tiene otro package-lock; fija el tracing a esta app Next.
  outputFileTracingRoot: path.join(__dirname),
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
};

module.exports = nextConfig;
