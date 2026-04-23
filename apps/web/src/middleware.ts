import { NextResponse, type NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth-utils';
import { redis, CACHE_KEYS, type CachedLicense } from '@/lib/redis';

// Define which routes require which modules
const MODULE_REQUIREMENTS: Record<string, string> = {
  '/dashboard/orders': 'mod_lr_management',
  '/dashboard/pallets': 'mod_pallet_management',
  '/dashboard/trips': 'mod_trip_management',
  '/dashboard/accounting': 'mod_core_accounting',
  '/dashboard/fleet': 'mod_fleet',
  '/dashboard/hr': 'mod_hr_payroll',
  '/dashboard/compliance': 'mod_gst_compliance',
};

// Define basic RBAC — minimum role required to access path
const ROLE_REQUIREMENTS: Record<string, string[]> = {
  '/dashboard/accounting': ['tenant_owner', 'company_admin', 'accountant'],
  '/dashboard/hr': ['tenant_owner', 'company_admin', 'hr_manager'],
  '/dashboard/settings': ['tenant_owner', 'company_admin'],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('session')?.value;
  const session = sessionToken ? await decrypt(sessionToken) : null;
  const user = session?.user;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  const isOnboardingPage = pathname.startsWith('/onboarding');
  const isVerifyEmailPage = pathname.startsWith('/verify-email');

  const isDashboardPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/super-admin');

  // 1. Not logged in -> Redirect to Login for protected pages
  if (!user && (isDashboardPage || isOnboardingPage)) {
    // Exception for verify-email as it might be accessed via link
    if (!isVerifyEmailPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2. Logged in -> Redirect away from Auth pages
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = user.companyId ? '/dashboard' : '/onboarding';
    return NextResponse.redirect(url);
  }

  // 3. Logged in + Dashboard page -> Check if onboarding is complete
  if (user && isDashboardPage) {
    if (!user.companyId) {
      const skippedOnboarding = request.cookies.get('onboarding_skipped')?.value;
      if (!skippedOnboarding) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }
  }

  // 4. Advanced Checks (License, Module, RBAC)
  if (user && isDashboardPage) {
    const { tenantId, role } = user;

    if (tenantId) {
      // License Check via Redis
      if (redis) {
        try {
          const cachedLicense = await redis.get<CachedLicense>(CACHE_KEYS.TENANT_LICENSE(tenantId));
          if (cachedLicense && !cachedLicense.isActive && pathname !== '/dashboard/settings/billing') {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard/settings/billing';
            url.searchParams.set('error', 'license_expired');
            return NextResponse.redirect(url);
          }
        } catch (e) {
          // Ignore Redis errors, fallback to allowing
        }
      }

      // Module Check via Redis
      const requiredModule = Object.entries(MODULE_REQUIREMENTS).find(([route]) =>
        pathname.startsWith(route)
      )?.[1];

      if (requiredModule && redis) {
        try {
          const cached = await redis.get<{ enabledModules: string[] }>(CACHE_KEYS.TENANT_MODULES(tenantId));
          if (cached && !cached.enabledModules.includes(requiredModule)) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            url.searchParams.set('error', 'module_disabled');
            return NextResponse.redirect(url);
          }
        } catch (e) {
          // Ignore Redis errors
        }
      }

      // RBAC Check
      const requiredRoles = Object.entries(ROLE_REQUIREMENTS).find(([route]) =>
        pathname.startsWith(route)
      )?.[1];

      if (requiredRoles && role && !requiredRoles.includes(role)) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'unauthorized_role');
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)',
  ],
};
