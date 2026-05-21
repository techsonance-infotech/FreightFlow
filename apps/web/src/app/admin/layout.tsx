import React from 'react';
import { getAdminSession } from '@/app/actions/admin/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { NavigationWrapper } from '@/components/admin/navigation-wrapper';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const isLoginPage = pathname === '/admin/login';

  // Strict session guard — Middleware handles most of this, but layout serves as a secondary barrier
  if (!session && !isLoginPage) {
    redirect('/admin/login');
  }

  // If it's the login page, render without the admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <NavigationWrapper session={session}>
      {children}
    </NavigationWrapper>
  );
}

