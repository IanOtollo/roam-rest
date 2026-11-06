/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  // Lets a production build be tested in its own folder while localhost keeps running.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Photos uploaded through the admin live in Convex storage.
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "http", hostname: "127.0.0.1", port: "3210" },
      { protocol: "http", hostname: "localhost", port: "3210" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
