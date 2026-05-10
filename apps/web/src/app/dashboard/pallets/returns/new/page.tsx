'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PalletReturnForm } from '@/components/orders/PalletReturnForm';

export default function NewPalletReturnPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-24">
      <PalletReturnForm 
        onSuccess={() => router.push('/dashboard/pallets/returns')} 
        onCancel={() => router.back()} 
      />
    </div>
  );
}
