'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PalletReturnForm } from '@/components/orders/PalletReturnForm';
import { toast } from 'sonner';

export default function EditPalletReturnPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/v1/pallets/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        setData(json);
      } catch (error) {
        toast.error('Failed to load return record');
        router.push('/dashboard/pallets/returns');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto pb-24">
      <PalletReturnForm 
        initialData={data}
        onSuccess={() => router.push('/dashboard/pallets/returns')} 
        onCancel={() => router.back()} 
      />
    </div>
  );
}
