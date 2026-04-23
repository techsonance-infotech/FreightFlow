import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
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

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  const isOnboardingPage = pathname.startsWith('/onboarding');

  const isDashboardPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/super-admin');

  // Not logged in -> Redirect to Login for protected pages
  if (!user && (isDashboardPage || isOnboardingPage)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Logged in -> Redirect away from Auth pages
  if (user && isAuthPage) {
    // Check if user has a company set up via app_metadata
    const companyId = user.app_metadata?.company_id;
    const url = request.nextUrl.clone();
    url.pathname = companyId ? '/dashboard' : '/onboarding';
    return NextResponse.redirect(url);
  }

  // Logged in + Dashboard page -> Check if onboarding is complete
  if (user && isDashboardPage) {
    const companyId = user.app_metadata?.company_id;
    // If no company_id in JWT metadata, redirect to onboarding
    // (unless they explicitly skipped — we check by looking for the skip cookie)
    if (!companyId) {
      const skippedOnboarding = request.cookies.get('onboarding_skipped')?.value;
      if (!skippedOnboarding) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }
  }

  // --- Advanced Authorization: License, Module, RBAC ---
  if (user && isDashboardPage) {
    const tenantId = user.app_metadata?.tenant_id as string | undefined;
    const role = user.app_metadata?.role as string | undefined;

    if (tenantId) {
      // 2. License Check
      let isLicenseActive = true;
      if (redis) {
        try {
          const cachedLicense = await redis.get<CachedLicense>(CACHE_KEYS.TENANT_LICENSE(tenantId));
          if (cachedLicense) {
            isLicenseActive = cachedLicense.isActive;
          } else {
            // Cache Miss: Fetch from Supabase directly
            const { data: tenant } = await supabase
              .from('tenants')
              .select('status, plan')
              .eq('id', tenantId)
              .single();
              
            if (tenant) {
              isLicenseActive = tenant.status === 'active';
              // Cache for 15 minutes to avoid DB hit on every route transition
              await redis.setex(
                CACHE_KEYS.TENANT_LICENSE(tenantId),
                900,
                { isActive: isLicenseActive, plan: tenant.plan }
              );
            }
          }
        } catch (e) {
          // Fallback if Redis fails
        }
      }

      if (!isLicenseActive && pathname !== '/dashboard/settings/billing') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/settings/billing';
        url.searchParams.set('error', 'license_expired');
        return NextResponse.redirect(url);
      }

      // 3. Module Check
      const requiredModule = Object.entries(MODULE_REQUIREMENTS).find(([route]) =>
        pathname.startsWith(route)
      )?.[1];

      if (requiredModule && redis) {
        try {
          let enabledModules: string[] | undefined;
          const cached = await redis.get<{ enabledModules: string[] }>(CACHE_KEYS.TENANT_MODULES(tenantId));
          
          if (cached) {
            enabledModules = cached.enabledModules;
          } else {
            // Cache Miss: Fetch from Supabase
            const { data: modules } = await supabase
              .from('tenant_modules')
              .select('module_key')
              .eq('tenant_id', tenantId)
              .eq('is_enabled', true);
              
            if (modules) {
              enabledModules = modules.map((m) => m.module_key);
              await redis.setex(CACHE_KEYS.TENANT_MODULES(tenantId), 900, { enabledModules });
            }
          }

          if (enabledModules && !enabledModules.includes(requiredModule)) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            url.searchParams.set('error', 'module_disabled');
            return NextResponse.redirect(url);
          }
        } catch (e) {
          // Ignore cache errors
        }
      }

      // 4. RBAC Check
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

  return supabaseResponse;
}
