'use server';

import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { TripEngine } from '@/services/trip-engine';
import { revalidatePath } from 'next/cache';

export async function settleTripAction(formData: {
  tripId: string;
  demurrage: number;
  extraCharges: number;
  notes?: string;
}) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return { error: 'Unauthorized' };
    }

    const { user } = session;

    const result = await TripEngine.settleTrip({
      tripId: formData.tripId,
      tenantId: user.tenantId,
      companyId: user.companyId!,
      settledBy: user.id,
      demurrage: formData.demurrage,
      extraCharges: formData.extraCharges,
      notes: formData.notes,
    });

    revalidatePath(`/dashboard/trips/${formData.tripId}`);
    revalidatePath('/dashboard/trips');

    return { success: true, data: result };
  } catch (error: any) {
    console.error('[SETTLE_TRIP_ACTION]', error);
    return { error: error.message || 'Failed to settle trip' };
  }
}
