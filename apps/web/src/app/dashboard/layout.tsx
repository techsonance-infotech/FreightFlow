import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import Link from 'next/link';
import { Topbar } from '@/components/dashboard/topbar';
import { verifyTenantLicense } from '@/lib/license-utils';
import { TrialBanner } from '@/components/license/trial-banner';
import { LicenseExpiredScreen } from '@/components/license/license-expired-screen';

import { headers } from 'next/headers';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (!session || !session.user) {
    redirect('/login');
  }

  const { user } = session;

  // Verify License
  const licenseStatus = await verifyTenantLicense(user.tenantId);

  // Allow access to support page even if license is invalid
  const isSupportPage = pathname === '/dashboard/support';

  if (!licenseStatus.valid && !isSupportPage) {
    return <LicenseExpiredScreen error={licenseStatus.error || 'Your license has expired.'} />;
  }

  if (isSupportPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-6xl">
          {children}
        </div>
        <footer className="mt-12 pb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
            FreightFlow &bull; Secure Support Channel
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col">
      <TrialBanner daysRemaining={licenseStatus.daysRemaining} plan={licenseStatus.plan} />

      <div className="relative flex-1 overflow-hidden">
        <Sidebar user={user} />

        <main className="ml-64 h-full flex flex-col relative overflow-hidden">
          <Topbar user={user} />

          <div className="flex-1 p-8 overflow-y-auto">
            {children}
          </div>

          <footer className="px-8 py-8 border-t border-slate-200 text-center bg-slate-50/50">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              FreightFlow &copy; {new Date().getFullYear()} &bull; Logistics & Supply Chain Intelligence
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mt-2">
              Proudly Built & Powered by <Link href="/dashboard/about" className="text-blue-500 hover:text-blue-600 transition-colors">TechSonance InfoTech LLP</Link>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
