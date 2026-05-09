import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { AboutSection } from '@/components/dashboard/about-section';

export default async function AboutPage() {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  return (
    <div className="bg-white min-h-screen">
      <AboutSection />
    </div>
  );
}
