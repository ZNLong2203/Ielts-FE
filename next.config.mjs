/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false,
    experimental: {
      turbo: {
        enabled: true,
        profiling: false, 
      },
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "*",
        },
        {
          protocol: "http",
          hostname: "*",
        },
      ],
    },
  };
  
  export default nextConfig;