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
  lrNo: z.string().optional(),
  gstBillNo: z.string().optional(),
  companyName: z.string().optional(),
  dealerId: z.string().uuid('Dealer is required'),
  consigneeId: z.string().uuid('Consignee is required'),
  ewayBillNo: z.string().regex(/^\d{12}$/, 'E-Way Bill must be exactly 12 digits').optional().or(z.literal('')),
  vehicleId: z.string().uuid('Vehicle is required'),
  date: z.string().or(z.date()),
  fromLocation: z.string().min(1, 'Origin point is required'),
  fromAddress: z.string().min(1, 'Origin address is required'),
  toLocation: z.string().min(1, 'Destination point is required'),
  toAddress: z.string().min(1, 'Destination address is required'),
  freight: z.number().min(0, 'Freight cannot be negative').default(0),
  hamali: z.number().min(0, 'Hamali cannot be negative').default(0),
  rateOn: z.enum(['weight', 'box']).default('weight'),
  rate: z.number().min(0, 'Rate cannot be negative').default(0),
  gstType: z.enum(['intra', 'inter']).default('intra'),
  cgstPct: z.number().min(0).max(100).default(0),
  sgstPct: z.number().min(0).max(100).default(0),
  igstPct: z.number().min(0).max(100).default(0),
  status: z.enum(['created', 'loaded', 'in_transit', 'delivered', 'cancelled']).default('created'),
  details: z.array(OrderDetailSchema).min(1, 'At least one item is required'),
});

export const PalletDetailSchema = z.object({
  id: z.string().uuid().optional(),
  palletDisplayId: z.string().default(''),
  code: z.string().optional().nullable().or(z.literal('')),
  qty: z.number().int().min(1, 'Quantity is required'),
  rate: z.number().int().min(0), // in paise
  consigneeName: z.string().default(''),
});

export const PalletConsigneeDetailSchema = z.object({
  id: z.string().uuid().optional(),
  consigneeName: z.string().min(1, 'Consignee Name is required'),
  qty: z.number().int().min(1, 'Quantity is required'),
  rate: z.number().int().min(0), // in paise
});

export const PalletSchema = z.object({
  id: z.string().uuid().optional(),
  lrNo: z.string().default(''),
  dealerId: z.string().uuid({ message: 'Dealer is required' }),
  consigneeId: z.string().uuid().optional().or(z.literal('')),
  vehicleId: z.string().uuid({ message: 'Vehicle is required' }),
  date: z.string().or(z.date()),
  companyName: z.string().default(''),
  partyCode: z.string().default(''),
  fromLocation: z.string().min(1, 'Origin Point is required'),
  fromAddress: z.string().min(1, 'Origin Address is required'),
  toLocation: z.string().min(1, 'Destination Point is required'),
  toAddress: z.string().min(1, 'Destination Address is required'),
  freight: z.number().min(0).default(0),
  hamali: z.number().min(0).default(0),
  rateOn: z.string().default('qty'),
  rate: z.number().min(0).default(0),
  cgstPct: z.coerce.number().min(0).default(2.5),
  sgstPct: z.coerce.number().min(0).default(2.5),
  igstPct: z.coerce.number().min(0).default(5.0),
  gstType: z.string().default('intra'),
  gstPct: z.number().min(0).max(100).default(0),
  type: z.enum(['OUTWARD', 'RETURN']).default('OUTWARD'),
  status: z.string().default('active'),
  isGstRequired: z.boolean().default(false),
  palletDetails: z.array(PalletDetailSchema).min(0),
  consigneeDetails: z.array(PalletConsigneeDetailSchema).optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderDetail = z.infer<typeof OrderDetailSchema>;
export type Pallet = z.infer<typeof PalletSchema>;
export type PalletDetail = z.infer<typeof PalletDetailSchema>;
export type PalletConsigneeDetail = z.infer<typeof PalletConsigneeDetailSchema>;
