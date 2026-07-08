import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { verifyBackupOTP, BackupOtpPurpose } from '@/lib/backup-otp';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { purpose, otp } = body;

    if (!purpose || !otp) {
      return NextResponse.json({ error: 'Purpose and OTP code are required' }, { status: 400 });
    }

    const result = await verifyBackupOTP(purpose as BackupOtpPurpose, otp);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Verify OTP API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
