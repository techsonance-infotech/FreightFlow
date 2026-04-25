import { z } from 'zod';

export const TripStatusSchema = z.enum(['created', 'loaded', 'in_transit', 'delivered', 'settled', 'cancelled']);

export const TripSchema = z.object({
  id: z.string().uuid().optional(),
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  coDriverId: z.string().uuid().optional().nullable(),
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  departureAt: z.string().optional().nullable(),
  expectedDeliveryAt: z.string().optional().nullable(),
  actualDeliveryAt: z.string().optional().nullable(),
  advanceAmount: z.number().int().nonnegative().default(0), // in paise
  status: TripStatusSchema.default('created'),
  orderIds: z.array(z.string().uuid()).min(1, 'At least one order must be assigned'),
});

export type Trip = z.infer<typeof TripSchema>;

export const TripExpenseTypeSchema = z.enum([
  'toll', 'fuel', 'repair', 'driver_allowance', 'night_halt', 'loading', 'police_rto', 'other'
]);

export const TripExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  tripId: z.string().uuid(),
  type: TripExpenseTypeSchema,
  amount: z.number().int().positive('Amount must be positive'), // in paise
  description: z.string().optional(),
  receiptUrl: z.string().url().optional().nullable(),
  location: z.string().optional(),
  geoLat: z.number().optional().nullable(),
  geoLng: z.number().optional().nullable(),
  recordedAt: z.string().optional(),
});

export type TripExpense = z.infer<typeof TripExpenseSchema>;

export const DriverAdvanceSchema = z.object({
  id: z.string().uuid().optional(),
  driverId: z.string().uuid(),
  tripId: z.string().uuid().optional().nullable(),
  amount: z.number().int().positive('Amount must be positive'), // in paise
  mode: z.enum(['cash', 'bank']),
  date: z.string(),
  purpose: z.string().optional(),
  recoveryAmount: z.number().int().nonnegative().default(0),
  status: z.enum(['pending', 'partially_recovered', 'recovered']).default('pending'),
});

export type DriverAdvance = z.infer<typeof DriverAdvanceSchema>;

export const TripSettlementSchema = z.object({
  tripId: z.string().uuid(),
  advanceAmount: z.number().int().nonnegative(),
  totalExpenses: z.number().int().nonnegative(),
  balance: z.number().int(),
  settlementType: z.enum(['refund', 'additional_payment']),
  notes: z.string().optional(),
});

export type TripSettlement = z.infer<typeof TripSettlementSchema>;
