import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current date/time in India (Asia/Kolkata)
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA formatting returns YYYY-MM-DD
    const dateStr = formatter.format(new Date()); // e.g. "2026-05-27"
    
    return NextResponse.json({ date: dateStr });
  } catch (error) {
    console.error('Failed to get system date:', error);
    // Fallback to UTC date
    const fallback = new Date().toISOString().split('T')[0];
    return NextResponse.json({ date: fallback });
  }
}
