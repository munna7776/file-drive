/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "vibrant-spoonbill-691.convex.cloud",
      },
      {
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
