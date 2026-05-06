import { prisma } from '@freightflow/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export default async function SeedAdminPage() {
  const email = 'admin@freightflow.com';
  const password = 'SuperAdminPassword123!';
  const passwordHash = await bcrypt.hash(password, 10);

  let admin: any = null;
  let error: string | null = null;

  try {
    admin = await prisma.platformAdmin.upsert({
      where: { email },
      update: {
        passwordHash,
        role: 'super_admin'
      },
      create: {
        email,
        passwordHash,
        role: 'super_admin'
      }
    });
  } catch (err: any) {
    error = err.message;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-500 p-8">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-10 border border-red-900/30 shadow-2xl">
          <h1 className="text-2xl font-black mb-4">Seed Failed</h1>
          <p className="font-mono text-xs opacity-70 break-all">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-10 border border-slate-700 shadow-2xl text-center">
        <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-black mb-4">Super Admin Initialized</h1>
        <p className="text-slate-400 mb-8 font-medium">
          Account <strong>{admin?.email}</strong> is now ready for use.
        </p>
        <a 
          href="/admin/login" 
          className="block w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all"
        >
          Go to Admin Login
        </a>
      </div>
    </div>
  );
}
