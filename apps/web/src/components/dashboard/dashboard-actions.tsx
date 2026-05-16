'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Printer, Plus, Loader2 } from 'lucide-react';
import { generateDashboardPDF } from '@/lib/pdf/dashboard-report';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DashboardActionsProps {
  kpis?: any;
}

export function DashboardActions({ kpis }: DashboardActionsProps) {
  const [loading, setLoading] = React.useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const doc = await generateDashboardPDF(kpis);
      doc.save(`FreightFlow_Report_${format(new Date(), 'ddMMMyyyy')}.pdf`);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="outline" 
        onClick={handleExport}
        disabled={loading}
        className="rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px] h-12 px-6 hover:bg-slate-50 transition-all flex items-center gap-2"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />}
        Export Reports
      </Button>
      
      <Link href="/dashboard/orders/new">
        <Button className="rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-xl shadow-blue-100 transition-all flex items-center gap-2">
          <Plus className="h-3 w-3" />
          Generate Mission
        </Button>
      </Link>
    </div>
  );
}
