import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Setup — FreightFlow',
  description: 'Set up your company details to get started with FreightFlow.',
};

export default async function OnboardingPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Check if company already exists
  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { company: true, tenant: true },
  });

  if (!appUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-accent-50/30">
      {/* Top Bar */}
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 p-1.5">
              <Image 
                src="/favicon_io/android-chrome-512x512.png" 
                alt="FreightFlow Logo" 
                width={28} 
                height={28} 
                className="object-contain" 
              />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#0B1E3A] leading-tight">FreightFlow</p>
              <p className="text-[11px] font-medium text-slate-400">Complete your setup</p>
            </div>
          </div>
          <div className="text-xs text-neutral-400">
            Welcome, <span className="font-medium text-neutral-600">{appUser.name}</span>
          </div>
        </div>
      </div>

      {/* Wizard Container */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Set Up Your Company</h1>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">
            Complete these steps to start managing your transport operations. You can skip and complete later.
          </p>
        </div>

        <OnboardingWizard 
          tenantName={appUser.tenant?.name || ''} 
          userEmail={appUser.email || ''} 
          initialData={appUser.company}
        />
      </div>
    </div>
  );
}
