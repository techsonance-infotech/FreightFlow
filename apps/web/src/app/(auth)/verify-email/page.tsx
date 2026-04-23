import { verifyEmail } from '@/app/actions/auth';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in duration-500">
        <XCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Invalid Link</h1>
        <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
          The verification link is missing or invalid. Please check your email for the correct link or try registering again.
        </p>
        <Link 
          href="/register"
          className="h-12 px-8 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center active:scale-[0.98]"
        >
          Back to Register
        </Link>
      </div>
    );
  }

  const result = await verifyEmail(token);

  if (result.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in duration-500">
        <XCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Verification Failed</h1>
        <p className="text-slate-600 max-w-md mb-8 leading-relaxed">{result.error}</p>
        <Link 
          href="/login"
          className="h-12 px-8 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center active:scale-[0.98]"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
        <CheckCircle2 className="relative w-16 h-16 text-[#3B82F6]" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Email Verified!</h1>
      <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
        Your email has been successfully verified. You can now log in to your account and start managing your transport business.
      </p>
      <Link 
        href="/login"
        className="h-12 px-8 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center active:scale-[0.98]"
      >
        Login to Dashboard
      </Link>
    </div>
  );
}
