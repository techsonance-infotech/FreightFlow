'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Download, RefreshCcw, FileText, LayoutDashboard, 
  ShieldAlert, Landmark, ArrowRight, Table as TableIcon,
  Layers, Package, FileCheck, Globe, Info, ShieldCheck,
  Search, Calculator, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  StatCard, ReportSectionHeader, ReportContainer, 
  Pagination, EmptyReportState, LoadingState 
} from '@/components/reports/report-components';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function GSTR1Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [isGstRegistered, setIsGstRegistered] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  const checkComplianceStatus = async () => {
    try {
      const response = await fetch('/api/v1/companies?current=true');
      const result = await response.json();
      console.log('[Compliance Debug]:', result);
      if (response.ok && result.data && result.data.length > 0) {
        const company = result.data[0]; 
        setCompanyName(company?.name || 'Your Company');
        // Allow access if either GSTIN or PAN is present
        setIsGstRegistered(!!(company?.gstin || company?.pan));
      } else {
        setCompanyName('Your Company');
        setIsGstRegistered(false);
      }
    } catch (error) {
      console.error('Failed to check compliance status');
      setIsGstRegistered(false);
    }
  };

  const fetchGSTR1 = async () => {
    if (isGstRegistered === false) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/compliance/gst/returns?period=${period}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch GSTR-1 data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkComplianceStatus();
  }, []);

  useEffect(() => {
    if (isGstRegistered !== null) {
      fetchGSTR1();
    }
  }, [period, isGstRegistered]);

  const handleDownloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('GSTR-1 JSON downloaded successfully');
  };

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    });
  };

  if (isGstRegistered === false) {
    return (
      <ReportContainer>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-[32px] border border-neutral-100 shadow-sm animate-in fade-in zoom-in duration-500">
          <div className="mb-8 p-8 bg-amber-50 rounded-[40px] text-amber-500 border border-amber-100 shadow-inner">
            <ShieldAlert className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Compliance Access Restricted</h1>
          <p className="text-neutral-500 max-w-lg mx-auto leading-relaxed text-lg font-medium">
            <span className="font-bold text-neutral-900">{companyName}</span> is currently registered as a <span className="text-amber-600 font-bold underline decoration-amber-200 underline-offset-4">Non-GST company</span>.
          </p>
          <div className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 max-w-md text-left flex gap-4">
            <Info className="h-6 w-6 text-neutral-400 shrink-0" />
            <p className="text-sm text-neutral-500 leading-relaxed">
              GSTR-1 filing and review tools are reserved for GST-registered entities. If your registration status has changed, please update your organization settings.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-10 h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-xs border-neutral-200 hover:bg-neutral-50 transition-all"
            onClick={() => window.location.href = '/dashboard/settings/organization'}
          >
            Update Org Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </ReportContainer>
    );
  }

  return (
    <ReportContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-accent-600 flex items-center justify-center">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.2em]">Compliance Intelligence</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">GSTR-1 Preparation</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Review outward supplies and generate GSTN-compliant JSON</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-neutral-100 shadow-sm">
          <input 
            type="month" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-transparent border-none px-4 py-2 text-xs font-bold outline-none text-neutral-700 cursor-pointer"
          />
          <div className="h-6 w-[1px] bg-neutral-100" />
          <Button 
            onClick={fetchGSTR1} 
            variant="ghost" 
            className="h-10 w-10 p-0 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-accent-600"
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button 
            onClick={handleDownloadJson} 
            disabled={!data || loading} 
            className="h-10 px-6 bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-600/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-3xl border border-neutral-100 animate-pulse shadow-sm" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 h-[600px] bg-white rounded-[32px] border border-neutral-100 animate-pulse shadow-sm" />
            <div className="space-y-8">
              <div className="h-48 bg-white rounded-[32px] border border-neutral-100 animate-pulse shadow-sm" />
              <div className="h-48 bg-white rounded-[32px] border border-neutral-100 animate-pulse shadow-sm" />
              <div className="h-48 bg-neutral-900 rounded-[32px] animate-pulse shadow-xl" />
            </div>
          </div>
        </div>
      ) : !data ? (
        <EmptyReportState 
          icon={<FileText />} 
          title="No GSTR-1 Data" 
          description="We couldn't find any taxable outward supplies for the selected period."
        />
      ) : (
        <div className="space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Taxable Turnover" 
              value={formatCurrency(data.totalTaxableValue)} 
              icon={<Globe className="h-5 w-5" />} 
              color="slate"
            />
            <StatCard 
              title="Output CGST" 
              value={formatCurrency(data.totalCGST)} 
              icon={<Landmark className="h-5 w-5" />} 
              color="blue"
            />
            <StatCard 
              title="Output SGST" 
              value={formatCurrency(data.totalSGST)} 
              icon={<Landmark className="h-5 w-5" />} 
              color="blue"
            />
            <StatCard 
              title="Output IGST" 
              value={formatCurrency(data.totalIGST)} 
              icon={<Globe className="h-5 w-5" />} 
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* B2B Invoices Table */}
            <div className="xl:col-span-2 bg-white rounded-[32px] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <ReportSectionHeader 
                title="B2B Invoices" 
                subtitle="Table 4A, 4B, 4C, 6B, 6C"
                className="px-8 pt-8 mb-4"
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Invoice Intelligence</TableHead>
                      <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Taxable Val</TableHead>
                      <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Taxes (C+S/I)</TableHead>
                      <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.b2b.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center">
                          <EmptyReportState 
                            icon={<TableIcon />} 
                            title="No B2B Data" 
                            description="No registered invoices found for this period."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.b2b.map((inv: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                          <TableCell className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-neutral-50 text-neutral-400 flex items-center justify-center font-black text-[10px] border border-neutral-100">
                                INV
                              </div>
                              <div>
                                <p className="text-sm font-black text-neutral-900 tracking-tight">{inv.invoiceNo}</p>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{format(new Date(inv.date), 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-right font-bold text-neutral-700">{formatCurrency(inv.taxableValue)}</TableCell>
                          <TableCell className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end">
                              <p className="text-sm font-bold text-accent-600">{formatCurrency(inv.cgst + inv.sgst + inv.igst)}</p>
                              <p className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.2em] mt-0.5">Output Tax</p>
                            </div>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-right">
                            <span className="text-sm font-black text-neutral-900 tracking-tighter bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                              {formatCurrency(inv.total)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
              </div>
            </div>

            {/* Side Summaries (Deep Analysis) */}
            <div className="space-y-8">
              {/* Document Summary */}
              <div className="bg-white rounded-[32px] border border-neutral-100 p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Document Audit
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-tight">Total Invoices Issued</span>
                    <span className="text-lg font-black text-neutral-900">{data.b2b.length + (data.b2cs?.length || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-neutral-100">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-tight">Cancelled Documents</span>
                    <span className="text-lg font-black text-error-600">0</span>
                  </div>
                </div>
              </div>

              {/* HSN Summary */}
              <div className="bg-white rounded-[32px] border border-neutral-100 p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  HSN Intelligence
                </h3>
                <div className="space-y-3">
                  <div className="p-5 rounded-2xl border border-neutral-100 bg-neutral-50/50 group hover:bg-white hover:shadow-md transition-all cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-accent-600 bg-accent-50 px-2 py-0.5 rounded border border-accent-100">9965</span>
                      <span className="text-sm font-black text-neutral-900">{formatCurrency(data.totalTaxableValue)}</span>
                    </div>
                    <p className="text-xs font-bold text-neutral-600 uppercase tracking-tight">Freight Transport Services</p>
                    <div className="mt-4 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-600 w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* B2C Summary */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-[32px] p-8 text-white shadow-xl shadow-neutral-900/10">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400 mb-6 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  B2C Small (B2CS)
                </h3>
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter">{formatCurrency(0)}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Net Aggregate B2C Turnover</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Compliance Status</span>
                  <Badge className="bg-success-500/20 text-success-400 border-success-500/30 font-black text-[9px] uppercase tracking-widest">OPTIMIZED</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ReportContainer>
  );
}
