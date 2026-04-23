// ============================================
// FreightFlow Pro — Date Utilities
// All dates stored as ISO 8601 UTC in DB
// Displayed in IST (Asia/Kolkata) as DD/MM/YYYY
// ============================================

import { format, parseISO, isValid } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/** Format a date to Indian standard DD/MM/YYYY in IST */
export function formatDateIST(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  const istDate = toZonedTime(d, IST_TIMEZONE);
  return format(istDate, 'dd/MM/yyyy');
}

/** Format a datetime to DD/MM/YYYY HH:mm in IST */
export function formatDateTimeIST(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  const istDate = toZonedTime(d, IST_TIMEZONE);
  return format(istDate, 'dd/MM/yyyy HH:mm');
}

/** Format a date for API params (YYYY-MM-DD) */
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Get today's date in IST as YYYY-MM-DD */
export function todayIST(): string {
  const now = toZonedTime(new Date(), IST_TIMEZONE);
  return format(now, 'yyyy-MM-dd');
}

/** Get current fiscal year (April to March) */
export function getCurrentFiscalYear(): { start: Date; end: Date; label: string } {
  const now = toZonedTime(new Date(), IST_TIMEZONE);
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();

  const fyStartYear = month >= 3 ? year : year - 1; // April = month 3
  const start = new Date(fyStartYear, 3, 1); // April 1
  const end = new Date(fyStartYear + 1, 2, 31); // March 31

  return {
    start,
    end,
    label: `FY ${fyStartYear}-${(fyStartYear + 1).toString().slice(2)}`,
  };
}
