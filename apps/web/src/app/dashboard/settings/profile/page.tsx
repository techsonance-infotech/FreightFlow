import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { User, Mail, Phone, Shield, Camera } from 'lucide-react';
import { redirect } from 'next/navigation';

import { ProfileForm } from '@/components/dashboard/profile-form';

export default async function ProfileSettingsPage() {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return <div>User not found</div>;

  return (
    <ProfileForm 
      initialData={{
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        avatarUrl: user.avatarUrl
      }} 
    />
  );
}
