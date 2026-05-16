import { z } from 'zod';

export const AccountTypeSchema = z.enum([
  'asset', 'liability', 'equity', 'revenue', 'expense'
]);

export const ChartOfAccountSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(1, 'Account name is required'),
  type: AccountTypeSchema,
  parentId: z.string().uuid().optional().nullable(),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ChartOfAccount = z.infer<typeof ChartOfAccountSchema>;

export const VoucherTypeSchema = z.enum([
  'payment', 'receipt', 'journal', 'contra', 'purchase', 'sales', 'debit_note', 'credit_note'
]);

export const JournalLineSchema = z.object({
  id: z.string().uuid().optional(),
  accountId: z.string().uuid(),
  description: z.string().optional(),
  debit: z.number().int().nonnegative().default(0), // in paise
  credit: z.number().int().nonnegative().default(0), // in paise
});

export const JournalEntrySchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string(),
  voucherType: VoucherTypeSchema,
  voucherNo: z.string().optional(),
  narration: z.string().optional(),
  lines: z.array(JournalLineSchema).min(2, 'At least two ledger lines are required'),
  // Transport-specific operational fields
  category: z.string().optional(),
  vehicleId: z.string().uuid().optional().nullable(),
  tripId: z.string().uuid().optional().nullable(),
  employeeId: z.string().uuid().optional().nullable(),
  status: z.enum(['draft', 'pending', 'posted']).default('posted'),
  metadata: z.any().optional(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const FreightInvoiceSchema = z.object({
  id: z.string().uuid().optional(),
  invoiceNo: z.string().optional(),
  date: z.string(),
  customerId: z.string().uuid(),
  orderIds: z.array(z.string().uuid()).default([]),
  subtotal: z.number().int().nonnegative(),
  cgst: z.number().int().nonnegative().default(0),
  sgst: z.number().int().nonnegative().default(0),
  igst: z.number().int().nonnegative().default(0),
  totalAmount: z.number().int().nonnegative(),
  notes: z.string().optional(),
  arAccountId: z.string().uuid().optional(),
  revenueAccountId: z.string().uuid().optional(),
});

export type FreightInvoice = z.infer<typeof FreightInvoiceSchema>;

export const PaymentSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string(),
  amount: z.number().int().positive(),
  mode: z.enum(['cash', 'bank', 'neft', 'cheque', 'upi']),
  referenceNo: z.string().optional(),
  accountId: z.string().uuid(), // Bank/Cash account
  partyId: z.string().uuid(), // Customer/Vendor ID
  notes: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;
