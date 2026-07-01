import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["unpdf", "@aws-sdk/client-s3", "cloudinary"],
  turbopack: {},
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
      dynamic: 60,
      static: 300,
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
        destination: "/home",
        permanent: false,
      },
      {
        source: "/inicio",
        destination: "/home",
        permanent: true,
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
