import { prisma } from '@freightflow/db';

export type LicenseVerificationResult = {
  valid: boolean;
  isTrial: boolean;
  daysRemaining: number;
  plan: string;
  error?: string;
};

import { unstable_cache } from 'next/cache';

export async function verifyTenantLicense(tenantId: string): Promise<LicenseVerificationResult> {
  try {
    return await unstable_cache(
      async (tid: string) => {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tid },
          select: {
            plan: true,
            status: true,
            licenseExpiresAt: true,
          }
        });

        if (!tenant) {
          return { valid: false, isTrial: false, daysRemaining: 0, plan: 'none', error: 'Workspace not found.' };
        }

        if (tenant.status !== 'active') {
          return { valid: false, isTrial: false, daysRemaining: 0, plan: tenant.plan, error: 'Workspace has been suspended.' };
        }

        if (!tenant.licenseExpiresAt) {
          return { valid: false, isTrial: false, daysRemaining: 0, plan: tenant.plan, error: 'No license expiration found.' };
        }

        const now = new Date();
        const expiryDate = new Date(tenant.licenseExpiresAt);
        const diffTime = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) {
          return {
            valid: false,
            isTrial: tenant.plan === 'trial',
            daysRemaining: 0,
            plan: tenant.plan,
            error: `Your ${tenant.plan === 'trial' ? '7-day trial' : 'license'} has expired.`
          };
        }

        return {
          valid: true,
          isTrial: tenant.plan === 'trial',
          daysRemaining,
          plan: tenant.plan,
        };
      },
      [`license-${tenantId}`],
      { revalidate: 300, tags: [`license-${tenantId}`] } // Cache for 5 minutes
    )(tenantId);
  } catch (error) {
    console.error('Database connection error in verifyTenantLicense:', error);
    return { valid: false, isTrial: false, daysRemaining: 0, plan: 'none', error: 'Failed to verify license.' };
  }
}
