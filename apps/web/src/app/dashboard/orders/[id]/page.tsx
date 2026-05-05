'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrderForm } from '@/components/orders/OrderForm';
import { toast } from 'sonner';

export default function EditOrderPage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/v1/orders/${id}`);
        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        
        // Prepare data for OrderForm (convert Paise back to Rupees for display)
        const formattedData = {
          ...data,
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          freight: data.freight / 100,
          hamali: data.hamali / 100,
          rate: data.rate / 100,
          details: (data.details || []).map((d: any) => ({
            ...d,
            // Add any detail-specific formatting if needed
          }))
        };
        
        setInitialData(formattedData);
      } catch (error) {
        toast.error('Error loading order details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading LR Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto py-6">
      <OrderForm initialData={initialData} isEditing={true} />
    </div>
  );
}
