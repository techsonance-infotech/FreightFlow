import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Suspense } from 'react';

export const metadata = {
  title: 'Reset Password | FreightFlow',
  description: 'Enter your OTP and set a new password for your FreightFlow account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-[500px] px-4">
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
