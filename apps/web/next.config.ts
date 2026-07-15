import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from 'path';

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {
  transpilePackages: ["@freightflow/db"],
  serverExternalPackages: ['@prisma/client', '@freightflow/db', 'prisma'],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

export default withSerwist(nextConfig);
