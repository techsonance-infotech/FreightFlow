'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { OrderPalletForm } from '@/components/orders/OrderPalletForm';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditPalletPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPallet() {
      try {
        const res = await fetch(`/api/v1/pallets/${params.id}`);
        if (!res.ok) throw new Error('Record not found');
        const pallet = await res.json();
        setData(pallet);
      } catch (error) {
        toast.error('Failed to retrieve record');
        router.push('/dashboard/pallets');
      } finally {
        setLoading(false);
      }
    }
    fetchPallet();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Pallet Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto py-6 px-4">
      <OrderPalletForm 
        initialData={data}
        onSuccess={() => router.push('/dashboard/pallets')} 
        onCancel={() => router.push('/dashboard/pallets')} 
      />
    </div>
  );
}
