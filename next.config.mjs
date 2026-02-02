/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "neeraj704.vercel.app",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
