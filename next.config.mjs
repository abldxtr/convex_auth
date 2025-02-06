import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
        // search: "",
      },
      {
        protocol: "https",
        hostname: "files.edgestore.dev",
        port: "",
        pathname: "/**",
        // search: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
        // search: "",
      },
      {
        protocol: "https",
        hostname: "assets.stickpng.com",
        port: "",
        pathname: "/**",
        // search: "",
      },
    ],
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn", "info"],
          }
        : false,
  },
  experimental: {
    reactCompiler: true,
  },
  // reactStrictMode: false,
};

// export default nextConfig;

export default withPWA(nextConfig);
