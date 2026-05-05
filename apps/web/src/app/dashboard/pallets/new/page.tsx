'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OrderPalletForm } from '@/components/orders/OrderPalletForm';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewPalletPage() {
  const router = useRouter();

  return (
    <div className="max-w-[1600px] mx-auto py-6 px-4">
      <OrderPalletForm 
        onSuccess={() => router.push('/dashboard/pallets')} 
        onCancel={() => router.push('/dashboard/pallets')} 
      />
    </div>
  );
}
