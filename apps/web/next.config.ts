import type { NextConfig } from "next";

import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@freightflow/db', 'prisma'],
  outputFileTracingIncludes: {
    '/**': [
      '../../packages/db/src/generated/client/*.node',
    ],
  },
};

export default nextConfig;
