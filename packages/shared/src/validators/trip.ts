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
  advanceAmount: z.number().nonnegative().default(0), // in paise (converted on backend)
  status: TripStatusSchema.default('created'),
  orderIds: z.array(z.string().uuid()).optional().default([]),
  palletIds: z.array(z.string().uuid()).optional().default([]),
}).refine(data => data.orderIds.length > 0 || data.palletIds.length > 0, {
  message: "At least one LR or Pallet must be assigned to the trip",
  path: ["orderIds"]
});

export type Trip = z.infer<typeof TripSchema>;

export const TripExpenseTypeSchema = z.enum([
  'toll', 'fuel', 'repair', 'driver_allowance', 'night_halt', 'loading', 'police_rto', 'other'
]);

export const TripExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  tripId: z.string().uuid(),
  type: TripExpenseTypeSchema,
  amount: z.number().positive('Amount must be positive'), // in paise (converted on backend)
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
  amount: z.number().positive('Amount must be positive'), // in paise (converted on backend)
  mode: z.enum(['cash', 'bank']),
  date: z.string(),
  purpose: z.string().optional(),
  recoveryAmount: z.number().nonnegative().default(0),
  status: z.enum(['pending', 'partially_recovered', 'recovered']).default('pending'),
});

export type DriverAdvance = z.infer<typeof DriverAdvanceSchema>;

export const TripSettlementSchema = z.object({
  tripId: z.string().uuid(),
  advanceAmount: z.number().nonnegative(),
  totalExpenses: z.number().nonnegative(),
  balance: z.number(),
  settlementType: z.enum(['refund', 'additional_payment']),
  notes: z.string().optional(),
});

export type TripSettlement = z.infer<typeof TripSettlementSchema>;

// --- Phase 2 Additions: Update, Recovery, and Search schemas ---

export const TripUpdateSchema = z.object({
  status: TripStatusSchema.optional(),
  fromLocation: z.string().min(1).optional(),
  toLocation: z.string().min(1).optional(),
  departureAt: z.string().optional().nullable(),
  expectedDeliveryAt: z.string().optional().nullable(),
  actualDeliveryAt: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type TripUpdate = z.infer<typeof TripUpdateSchema>;

export const AdvanceRecoverySchema = z.object({
  recoveryAmount: z.number().positive('Recovery amount must be positive'),
  mode: z.enum(['cash', 'bank']),
  notes: z.string().optional(),
});

export type AdvanceRecovery = z.infer<typeof AdvanceRecoverySchema>;

/** Valid status transitions for the trip state machine */
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  created: ['loaded', 'cancelled'],
  loaded: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: ['settled'],
  settled: [],
  cancelled: [],
};
