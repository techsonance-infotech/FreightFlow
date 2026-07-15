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
  serverExternalPackages: ['@prisma/client', 'prisma'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/': [
      '../../node_modules/.prisma/client/libquery_engine-rhel-openssl-*.so.node',
      '../../node_modules/.prisma/client/schema.prisma',
      '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/libquery_engine-rhel-openssl-*.so.node',
      '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/schema.prisma',
    ],
  },
};

export default withSerwist(nextConfig);
