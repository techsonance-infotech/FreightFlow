import { NextResponse, type NextRequest } from 'next/server';
import { decrypt, updateSession } from '@/lib/auth-utils';
import { findNavItemByPath, hasPermission } from '@/config/rbac';
import { redis, CACHE_KEYS, type CachedLicense } from '@/lib/redis';

// Define which routes require which modules
const MODULE_REQUIREMENTS: Record<string, string> = {
  '/dashboard/orders': 'mod_lr_management',
  '/dashboard/pallets': 'mod_pallet_management',
  '/dashboard/trips': 'mod_trip_management',
  '/dashboard/accounting': 'core_accounting',
  '/dashboard/billing': 'freight_billing',
  '/dashboard/fleet': 'fleet_management',
  '/dashboard/hr': 'driver_hr',
  '/dashboard/compliance': 'compliance',
  '/dashboard/fuel': 'fuel_management',
  '/dashboard/purchase': 'purchase_expense',
  '/dashboard/dispatch': 'crm_dispatch',
  '/dashboard/ai': 'ai_analytics',
  '/dashboard/reports': 'reporting',
};

// Define strict RBAC — minimum role required to access path
const ROLE_REQUIREMENTS: Record<string, string[]> = {
  '/dashboard/accounting': ['tenant_owner', 'fleet_owner', 'accountant', 'auditor'],
  '/dashboard/billing': ['tenant_owner', 'fleet_owner', 'accountant', 'ops_manager'],
  '/dashboard/hr': ['tenant_owner', 'fleet_owner', 'hr_manager'],
  '/dashboard/compliance': ['tenant_owner', 'fleet_owner', 'accountant', 'auditor'],
  '/dashboard/settings': ['tenant_owner', 'fleet_owner'],
  '/dashboard/masters': ['tenant_owner', 'fleet_owner', 'ops_manager', 'accountant', 'hr_manager', 'maintenance_supervisor'],
  '/dashboard/fleet': ['tenant_owner', 'fleet_owner', 'ops_manager', 'maintenance_supervisor'],
  '/dashboard/fuel': ['tenant_owner', 'fleet_owner', 'ops_manager', 'maintenance_supervisor'],
  '/dashboard/trips': ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer', 'driver'],
  '/dashboard/dispatch': ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer'],
  '/dashboard/ai': ['tenant_owner', 'fleet_owner', 'ops_manager'],
  '/dashboard/reports': ['tenant_owner', 'fleet_owner', 'accountant', 'ops_manager', 'hr_manager', 'auditor'],
  '/dashboard/admin': ['super_admin'],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware logic for Server Action requests to prevent fetch failures
  if (request.headers.has('next-action')) {
    return NextResponse.next();
  }

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

  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/super-admin');
  const isAdminAuthPage = pathname === '/admin/login';

  // 1. Admin Session Check
  const adminToken = request.cookies.get('ff_admin_session')?.value;
  const adminSession = adminToken ? await decrypt(adminToken) : null;

  // Protect /admin routes
  if (isAdminPage && !isAdminAuthPage) {
    if (!adminSession || !['super_admin', 'platform_admin'].includes(adminSession.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirectTo', pathname);
      
      const response = NextResponse.redirect(url);
      if (adminToken) response.cookies.delete('ff_admin_session');
      return response;
    }
  }

  // Redirect logged-in admin away from login page
  if (adminSession && isAdminAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  // 2. Not logged in -> Redirect to Login for protected pages
  if (!user && (isDashboardPage || isOnboardingPage)) {
    // Exception for verify-email as it might be accessed via link
    if (!isVerifyEmailPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      
      const response = NextResponse.redirect(url);
      // Clear session cookie if it exists but is invalid
      if (sessionToken) {
        response.cookies.delete('session');
      }
      return response;
    }
  }

  // 3. Logged in -> Redirect away from Auth pages (Persistent Session)
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = (user.role === 'super_admin' || user.companyId) ? '/dashboard' : '/onboarding';
    return NextResponse.redirect(url);
  }

  // 3. Logged in + Dashboard page -> Check if onboarding is complete
  if (user && isDashboardPage) {
    if (!user.companyId && user.role !== 'super_admin') {
      const skippedOnboarding = request.cookies.get('onboarding_skipped')?.value;
      if (!skippedOnboarding) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }
  }

  // 4. Advanced Checks (License, Module, RBAC)
  let response = NextResponse.next();
  
  // Refresh session if logged in
  if (user) {
    const updatedResponse = await updateSession(request);
    if (updatedResponse) {
      response = updatedResponse;
    }
  }

  if (user && isDashboardPage) {
    const { tenantId, role } = user;

    if (tenantId) {
      // Parallelize external checks (Redis)
      const requiredModule = Object.entries(MODULE_REQUIREMENTS).find(([route]) =>
        pathname.startsWith(route)
      )?.[1];

      try {
        const [cachedLicense, cachedModules] = await Promise.all([
          redis ? redis.get<CachedLicense>(CACHE_KEYS.TENANT_LICENSE(tenantId)) : Promise.resolve(null),
          (requiredModule && redis) ? redis.get<{ enabledModules: string[] }>(CACHE_KEYS.TENANT_MODULES(tenantId)) : Promise.resolve(null)
        ]);

        // License Check
        if (cachedLicense && !cachedLicense.isActive && pathname !== '/dashboard/settings/billing' && pathname !== '/dashboard/support') {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard/settings/billing';
          url.searchParams.set('error', 'license_expired');
          return NextResponse.redirect(url);
        }

        // Module Check
        if (requiredModule && cachedModules && !cachedModules.enabledModules.includes(requiredModule)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          url.searchParams.set('error', 'module_disabled');
          return NextResponse.redirect(url);
        }
      } catch (e) {
        // Quietly fallback on Redis errors
      }

      // RBAC Check (Dynamic based on NAV_ITEMS)
      const navItem = findNavItemByPath(pathname);
      
      if (navItem) {
        if (!hasPermission(role, navItem, user.permissions)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          url.searchParams.set('error', 'unauthorized_access');
          
          // Guard against infinite loop if already on /dashboard
          if (pathname === '/dashboard') {
            return response;
          }
          
          return NextResponse.redirect(url);
        }
      } else {
        // Fallback for paths not explicitly in NAV_ITEMS but requiring protection
        const requiredRoles = Object.entries(ROLE_REQUIREMENTS).find(([route]) =>
          pathname.startsWith(route)
        )?.[1];
  
        if (requiredRoles && role && !requiredRoles.includes(role)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          url.searchParams.set('error', 'unauthorized_role');

          // Guard against infinite loop if already on /dashboard
          if (pathname === '/dashboard') {
            return response;
          }

          return NextResponse.redirect(url);
        }
      }
    }
  }

  // Add Security Headers for sensitive pages (Dashboard & Auth) 
  // to prevent "back" button from showing cached data after login/logout
  if (isDashboardPage || isAuthPage) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Inject current path for Server Components
  response.headers.set('x-url', request.url);
  response.headers.set('x-pathname', pathname);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)',
  ],
};
