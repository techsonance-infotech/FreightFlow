import { z } from 'zod';

export const OrderDetailSchema = z.object({
  id: z.string().uuid().optional(),
  productName: z.string().min(1, 'Product name is required'),
  boxCount: z.number().int().min(0).default(0),
  packingType: z.string().optional(),
  weight: z.number().min(0).default(0),
  dcpiNo: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  lrNo: z.number().int().optional(),
  gstBillNo: z.string().optional(),
  dealerId: z.string().uuid('Invalid dealer'),
  consigneeId: z.string().uuid('Invalid consignee'),
  ewayBillNo: z.string().regex(/^\d{12}$/, 'E-Way Bill must be 12 digits').optional().or(z.literal('')),
  vehicleId: z.string().uuid('Invalid vehicle'),
  date: z.string().or(z.date()),
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  freight: z.number().int().min(0).default(0),    // in paise
  hamali: z.number().int().min(0).default(0),     // in paise
  rateOn: z.enum(['weight', 'box']).default('weight'),
  rate: z.number().int().min(0).default(0),       // in paise
  cgstPct: z.number().min(0).max(100).default(0),
  sgstPct: z.number().min(0).max(100).default(0),
  status: z.enum(['created', 'loaded', 'in_transit', 'delivered', 'cancelled']).default('created'),
  details: z.array(OrderDetailSchema).min(1, 'At least one item is required'),
});

export const PalletDetailSchema = z.object({
  id: z.string().uuid().optional(),
  qty: z.number().int().min(1),
  rate: z.number().int().min(0), // in paise
});

export const PalletConsigneeDetailSchema = z.object({
  id: z.string().uuid().optional(),
  consigneeName: z.string().min(1),
  qty: z.number().int().min(1),
  rate: z.number().int().min(0), // in paise
});

export const PalletSchema = z.object({
  id: z.string().uuid().optional(),
  lrNo: z.number().int().optional(),
  dealerId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  date: z.string().or(z.date()),
  companyName: z.string().min(1),
  partyCode: z.string().optional(),
  gstPct: z.number().min(0).max(100).default(0),
  status: z.string().default('active'),
  palletDetails: z.array(PalletDetailSchema).min(1),
  consigneeDetails: z.array(PalletConsigneeDetailSchema).optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderDetail = z.infer<typeof OrderDetailSchema>;
export type Pallet = z.infer<typeof PalletSchema>;
export type PalletDetail = z.infer<typeof PalletDetailSchema>;
export type PalletConsigneeDetail = z.infer<typeof PalletConsigneeDetailSchema>;
