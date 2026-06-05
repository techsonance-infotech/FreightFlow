import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a date strictly using UTC to prevent client timezone offset shifts */
export function formatUtcDate(dateInput: any, formatStr: string = 'dd/MM/yyyy'): string {
  if (!dateInput) return '';
  
  let d: Date;
  if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      d = new Date(`${dateInput}T00:00:00.000Z`);
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }
  
  if (isNaN(d.getTime())) return '';

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.format(d).split('/'); // returns "MM/DD/YYYY"
    const month = parts[0];
    const day = parts[1];
    const year = parts[2];
    const monthIdx = parseInt(month) - 1;

    const monthsFull = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthsShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    if (formatStr === 'dd/MM/yyyy') {
      return `${day}/${month}/${year}`;
    }
    if (formatStr === 'dd MMMM yyyy') {
      return `${day} ${monthsFull[monthIdx]} ${year}`;
    }
    if (formatStr === 'dd MMM yyyy') {
      return `${day} ${monthsShort[monthIdx]} ${year}`;
    }
    if (formatStr === 'dd MMM') {
      return `${day} ${monthsShort[monthIdx]}`;
    }
    if (formatStr === 'dd MMMM') {
      return `${day} ${monthsFull[monthIdx]}`;
    }
    if (formatStr === 'yyyyMMdd') {
      return `${year}${month}${day}`;
    }
    if (formatStr === 'yyyy-MM-dd') {
      return `${year}-${month}-${day}`;
    }
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    const day = String(d.getUTCDate()).padStart(2, '0');
    const monthIdx = d.getUTCMonth();
    const month = String(monthIdx + 1).padStart(2, '0');
    const year = d.getUTCFullYear();

    const monthsFull = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthsShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    if (formatStr === 'dd/MM/yyyy') {
      return `${day}/${month}/${year}`;
    }
    if (formatStr === 'dd MMMM yyyy') {
      return `${day} ${monthsFull[monthIdx]} ${year}`;
    }
    if (formatStr === 'dd MMM yyyy') {
      return `${day} ${monthsShort[monthIdx]} ${year}`;
    }
    if (formatStr === 'dd MMM') {
      return `${day} ${monthsShort[monthIdx]}`;
    }
    if (formatStr === 'dd MMMM') {
      return `${day} ${monthsFull[monthIdx]}`;
    }
    if (formatStr === 'yyyyMMdd') {
      return `${year}${month}${day}`;
    }
    if (formatStr === 'yyyy-MM-dd') {
      return `${year}-${month}-${day}`;
    }
    
    return `${day}/${month}/${year}`;
  }
}

/** Formats a weight in KG, preserving precision up to 3 decimal places without truncation */
export function formatWeight(weight: any): string {
  if (weight === null || weight === undefined || weight === '') return '0.000';
  const val = typeof weight === 'number' ? weight : parseFloat(weight.toString());
  if (isNaN(val)) return '0.000';
  return val.toFixed(3);
}

/** Fetches current date in YYYY-MM-DD from online sources to bypass client system clock errors */
export async function fetchOnlineDate(): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch('/api/v1/system-date', { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      const data = await res.json();
      if (data?.date) return data.date;
    }
  } catch (e) {
    console.warn('Local system-date fetch failed, trying public time API...', e);
  }

  // Fallback to online WorldTimeAPI
  const controller2 = new AbortController();
  const id2 = setTimeout(() => controller2.abort(), 3000);
  try {
    const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Kolkata', { signal: controller2.signal });
    clearTimeout(id2);
    if (res.ok) {
      const data = await res.json();
      if (data?.datetime) {
        return data.datetime.split('T')[0];
      }
    }
  } catch (e) {
    console.warn('WorldTimeAPI fetch failed, trying TimeAPI...', e);
  }

  // Second fallback
  const controller3 = new AbortController();
  const id3 = setTimeout(() => controller3.abort(), 3000);
  try {
    const res = await fetch('https://timeapi.io/api/time/current/zone?timeZone=Asia/Kolkata', { signal: controller3.signal });
    clearTimeout(id3);
    if (res.ok) {
      const data = await res.json();
      if (data?.dateTime) {
        return data.dateTime.split('T')[0];
      }
    }
  } catch (e) {
    console.error('All online date fetches failed.', e);
  }

  // Final fallback to client machine clock formatted in Asia/Kolkata
  try {
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(new Date());
  } catch (e) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}


