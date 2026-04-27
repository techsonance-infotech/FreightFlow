import { Redis } from '@upstash/redis';

// Only initialize if the URL is provided (prevents crashing during local dev if not set yet)
export const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Cache key generators
 */
export const CACHE_KEYS = {
  TENANT_LICENSE: (tenantId: string) => `tenant:${tenantId}:license`,
  TENANT_MODULES: (tenantId: string) => `tenant:${tenantId}:modules`,
  USER_PERMISSIONS: (userId: string) => `user:${userId}:permissions`,
};

/**
 * Type definitions for cached data
 */
export interface CachedLicense {
  isActive: boolean;
  plan: string;
  expiresAt: string | null;
}

export interface CachedModules {
  enabledModules: string[];
}
