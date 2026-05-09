import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getTyres } from '@/app/actions/fleet/tyres';
import { TyreManager } from '@/components/fleet/tyre-manager';

export default async function TyreTrackingPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const tyres = await getTyres();

  return (
    <div className="bg-white min-h-screen">
      <TyreManager tyres={tyres} />
    </div>
  );
}
