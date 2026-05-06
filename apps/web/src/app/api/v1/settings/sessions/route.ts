import { NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/auth-utils';
import { headers } from 'next/headers';

// GET — Return the current session info (JWT-based, so only 1 session visible server-side)
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() 
            || headerList.get('x-real-ip') 
            || 'Unknown';
    const ua = headerList.get('user-agent') || '';

    // Parse device and browser from user-agent
    const device = parseDevice(ua);
    const browser = parseBrowser(ua);

    const currentSession = {
      id: 'current',
      device,
      browser,
      ip,
      lastActive: new Date().toISOString(),
      isCurrent: true,
    };

    return NextResponse.json({ data: [currentSession] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — Sign out (destroy session cookie)
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For JWT-based auth, we delete the cookie. 
    // In a multi-session system, you'd invalidate specific tokens.
    await deleteSession();
    
    return NextResponse.json({ success: true, message: 'Sessions revoked' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseDevice(ua: string): string {
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android.*Mobile/.test(ua)) return 'Android Phone';
  if (/Android/.test(ua)) return 'Android Tablet';
  if (/Macintosh/.test(ua)) return 'MacBook / Mac';
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11 PC';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Linux/.test(ua)) return 'Linux Desktop';
  return 'Unknown Device';
}

function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return 'Microsoft Edge';
  if (/Chrome\//.test(ua) && !/Edg/.test(ua)) return 'Google Chrome';
  if (/Firefox\//.test(ua)) return 'Mozilla Firefox';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Apple Safari';
  if (/OPR\//.test(ua)) return 'Opera';
  return 'Unknown Browser';
}
