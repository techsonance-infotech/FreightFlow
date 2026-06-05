import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a date strictly using UTC to prevent client timezone offset shifts */
export function formatUtcDate(dateInput: any, formatStr: string = 'dd/MM/yyyy'): string {
  if (!dateInput) return '';
  
  // If it's a Date object, convert to ISO string first to extract pure UTC date
  let d: Date;
  if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === 'string') {
    // If it's a pure date string like "2026-05-27", we can parse it as UTC by appending T00:00:00Z if it doesn't have it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      d = new Date(`${dateInput}T00:00:00.000Z`);
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }
  
  if (isNaN(d.getTime())) return '';

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
  
  // Default fallback to dd/MM/yyyy
  return `${day}/${month}/${year}`;
}

/** Formats a weight in KG, preserving precision up to 3 decimal places without truncation */
export function formatWeight(weight: any): string {
  if (weight === null || weight === undefined || weight === '') return '0.000';
  const val = typeof weight === 'number' ? weight : parseFloat(weight.toString());
  if (isNaN(val)) return '0.000';
  return val.toFixed(3);
}

