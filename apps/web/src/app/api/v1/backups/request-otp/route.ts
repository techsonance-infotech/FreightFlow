import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { requestBackupOTP, BackupOtpPurpose } from '@/lib/backup-otp';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { purpose } = body;

    if (!purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 });
    }

    const result = await requestBackupOTP(purpose as BackupOtpPurpose);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Request OTP API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
