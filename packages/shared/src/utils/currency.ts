// ============================================
// FreightFlow Pro — Currency Utilities
// All amounts stored as INTEGER (paise) in DB
// ============================================

/** Convert rupees (number input) to paise for DB storage */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise (from DB) to rupees for display */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/** Format paise as Indian Rupee display string */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** Format paise as compact Indian Rupee (e.g., ₹4.2L) */
export function formatINRCompact(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  }
  if (rupees >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`;
  }
  if (rupees >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}K`;
  }
  return formatINR(paise);
}

/** Calculate GST amounts from subtotal in paise */
export function calculateGST(
  subtotalPaise: number,
  cgstPct: number,
  sgstPct: number
): { cgst: number; sgst: number; total: number } {
  const cgst = Math.round((subtotalPaise * cgstPct) / 100);
  const sgst = Math.round((subtotalPaise * sgstPct) / 100);
  return {
    cgst,
    sgst,
    total: subtotalPaise + cgst + sgst,
  };
}

/** Determine if transaction is inter-state (IGST) or intra-state (CGST+SGST) */
export function isInterState(originStateCode: string, destStateCode: string): boolean {
  return originStateCode !== destStateCode;
}
