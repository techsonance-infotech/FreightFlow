import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const { user } = session;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <Topbar user={user} />

        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
        
        <footer className="px-8 py-6 border-t border-slate-200 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            FreightFlow Pro &copy; {new Date().getFullYear()} &bull; Logistics & Supply Chain Intelligence
          </p>
        </footer>
      </main>
    </div>
  );
}
