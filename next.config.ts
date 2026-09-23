import type { NextConfig } from "next";

const gcsBucket = process.env.GCS_BUCKET?.trim();

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@google-cloud/cloud-sql-connector",
    "@google-cloud/storage",
    "google-auth-library",
    "pg",
  ],
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: gcsBucket ? `/${gcsBucket}/**` : "/**",
      },
    ],
  },
  async headers() {
    const adminHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [
      { source: "/admin/:path*", headers: adminHeaders },
      { source: "/api/admin/:path*", headers: adminHeaders },
    ];
  },
};

export default nextConfig;
