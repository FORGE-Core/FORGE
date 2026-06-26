import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["unpdf", "@aws-sdk/client-s3", "cloudinary"],
  turbopack: {
    root: path.join(__dirname),
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-avatar",
      "@radix-ui/react-scroll-area",
    ],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/inicio",
        permanent: false,
      },
      {
        source: "/dashboard/:path*",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/simulations",
        destination: "/activities",
        permanent: false,
      },
      {
        source: "/simulations/:path*",
        destination: "/activities",
        permanent: false,
      },
      {
        source: "/reports/inclusion",
        destination: "/reports?tab=inclusion",
        permanent: false,
      },
      {
        source: "/reports/learning-patterns",
        destination: "/reports?tab=patterns",
        permanent: false,
      },
      {
        source: "/accessibility",
        destination: "/profile",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
