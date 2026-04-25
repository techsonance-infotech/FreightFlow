'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportViewer } from '@/components/reports/report-viewer';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(false);
  const [plData, setPlData] = useState<any[]>([]);
  const [tbData, setTbData] = useState<any[]>([]);

  const fetchPL = async (filters?: any) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/v1/reports/profit-loss?${params}`);
      const data = await res.json();
      setPlData(data.details || []);
    } catch (error) {
      toast.error('Failed to load P&L report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val / 100);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
      </div>

      <Tabs defaultValue="pl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="tb">Trial Balance</TabsTrigger>
          <TabsTrigger value="bs" disabled>Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="pl" className="space-y-4">
          <ReportViewer
            title="Statement of Profit & Loss"
            subtitle="Income and Expenditure summary"
            data={plData}
            isLoading={loading}
            onFilterChange={fetchPL}
            columns={[
              { key: 'accountCode', label: 'Code' },
              { key: 'accountName', label: 'Account Name' },
              { key: 'accountType', label: 'Category', format: (v) => <span className="capitalize">{v}</span> },
              { 
                key: 'balance', 
                label: 'Amount', 
                format: (v) => (
                  <span className={v < 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {formatCurrency(Math.abs(v))}
                  </span>
                ) 
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="tb" className="space-y-4">
           <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
             Trial Balance drill-down coming soon. Use P&L for current view.
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
