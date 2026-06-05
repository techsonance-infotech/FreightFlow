'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Landmark, Download, RefreshCcw, 
  Search, Calendar, Filter, Users, ChevronRight,
  Package, Layers, Calculator, ShieldCheck,
  Plus, ArrowRight, FileSpreadsheet,
  ChevronLeft, LayoutGrid, CheckCircle2, ShieldAlert,
  Info, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ReportContainer, StatCard, ReportSectionHeader, 
  LoadingState, EmptyReportState, Pagination
} from '@/components/reports/report-components';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn, formatUtcDate } from '@/lib/utils';

export default function TDSManagementPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGstRegistered, setIsGstRegistered] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState('');
  
  // Filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [vendorId, setVendorId] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState(''); // true/false string
  const [page, setPage] = useState(1);
  const [dealers, setDealers] = useState<any[]>([]);

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

  const fetchDealers = async () => {
    try {
      const res = await fetch('/api/v1/masters/dealers');
      const json = await res.json();
      if (json.data) setDealers(json.data);
    } catch (err) {
      console.error('Failed to fetch dealers');
    }
  };

  const fetchTDSRegister = async () => {
    if (isGstRegistered === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        vendorId,
        section,
        deposited: status,
        page: page.toString(),
        limit: '10'
      });
      const res = await fetch(`/api/v1/compliance/tds?${params}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      toast.error('Failed to load TDS register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkComplianceStatus();
    fetchDealers();
  }, []);

  useEffect(() => {
    if (isGstRegistered !== null) {
      fetchTDSRegister();
    }
  }, [isGstRegistered, startDate, endDate, vendorId, section, status, page]);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(paise / 100);
  };

  if (isGstRegistered === false) {
    return (
      <ReportContainer>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-[32px] border border-neutral-100 shadow-sm animate-in fade-in zoom-in duration-500">
          <div className="mb-8 p-8 bg-amber-50 rounded-[40px] text-amber-500 border border-amber-100 shadow-inner">
            <ShieldAlert className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Tax Access Restricted</h1>
          <p className="text-neutral-500 max-w-lg mx-auto leading-relaxed text-lg font-medium">
            <span className="font-bold text-neutral-900">{companyName}</span> is currently registered as a <span className="text-amber-600 font-bold underline decoration-amber-200 underline-offset-4">Non-GST/Non-Tax entity</span>.
          </p>
          <div className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 max-w-md text-left flex gap-4">
            <Info className="h-6 w-6 text-neutral-400 shrink-0" />
            <p className="text-sm text-neutral-500 leading-relaxed">
              TDS registration and auditing tools are reserved for tax-compliant entities. Please update your organization's GSTIN and TAN settings to unlock these features.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-10 h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-xs border-neutral-200 hover:bg-neutral-50 transition-all"
            onClick={() => window.location.href = '/dashboard/settings/organization'}
          >
            Update Organization Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </ReportContainer>
    );
  }

  return (
    <ReportContainer>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Tax Compliance</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">TDS Register</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Audit trail of Tax Deducted at Source (TDS) for vendor payments</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
            <Download className="h-4 w-4 mr-2" />
            Export 26Q (JSON)
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchTDSRegister}
            className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-xs uppercase tracking-widest transition-all bg-white"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[240px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Entity Search</p>
          <div className="relative group">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
            <select 
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Entities</option>
              {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="min-w-[240px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Deduction Period</p>
          <div className="flex items-center gap-2 bg-neutral-50 p-1 rounded-2xl border border-neutral-100">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 px-2"
            />
            <div className="h-4 w-[1px] bg-neutral-200" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 px-2"
            />
          </div>
        </div>

        <div className="min-w-[140px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Section</p>
          <select 
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Sections</option>
            <option value="194C">Sec 194C (Contract)</option>
            <option value="194I">Sec 194I (Rent)</option>
            <option value="194J">Sec 194J (Prof.)</option>
          </select>
        </div>

        <div className="min-w-[140px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Deposit Status</p>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Entries</option>
            <option value="true">Deposited</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState rows={8} />
      ) : !data ? (
        <EmptyReportState 
          title="No TDS Records" 
          description="No tax deduction entries found for the selected filters."
        />
      ) : (
        <div className="space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Gross Amount" 
              value={formatCurrency(data.totalBaseAmount)} 
              icon={<Calculator className="h-5 w-5" />} 
              color="slate"
            />
            <StatCard 
              title="TDS Deducted" 
              value={formatCurrency(data.totalTDS)} 
              icon={<ShieldCheck className="h-5 w-5" />} 
              color="amber"
            />
            <StatCard 
              title="Deposited" 
              value={formatCurrency(data.totalDeposited)} 
              icon={<FileCheck className="h-5 w-5" />} 
              color="emerald"
            />
            <StatCard 
              title="Pending Liability" 
              value={formatCurrency(data.totalTDS - data.totalDeposited)} 
              icon={<ShieldAlert className="h-5 w-5" />} 
              color="rose"
            />
          </div>

          {/* Section Summary */}
          <div className="flex flex-wrap gap-4">
            {Object.entries(data.sections).map(([sec, val]: [string, any]) => (
              <div key={sec} className="bg-white px-5 py-3 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-3">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">SEC {sec}</span>
                <span className="text-sm font-black text-neutral-900">{formatCurrency(val)}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/50 border-none">
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Date & Vendor</TableHead>
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400">Compliance</TableHead>
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Deduction</TableHead>
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center">Status</TableHead>
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Challan Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <EmptyReportState title="No Entries" description="Adjust filters to view data" />
                    </TableCell>
                  </TableRow>
                ) : (
                  data.entries.map((entry: any) => (
                    <TableRow key={entry.id} className="group hover:bg-neutral-50/50 transition-colors border-b border-neutral-50 last:border-none">
                      <TableCell className="px-8 py-6">
                        <div>
                          <p className="text-sm font-black text-neutral-900 tracking-tight">{entry.vendorName}</p>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{formatUtcDate(entry.createdAt, 'dd MMM yyyy')}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Section {entry.section}</span>
                          <span className="text-xs font-bold text-neutral-600">PAN: {entry.vendorPan}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <p className="text-sm font-black text-neutral-900 tracking-tighter">{formatCurrency(entry.tdsAmount)}</p>
                          <p className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">@{entry.rate}% of {formatCurrency(entry.baseAmount)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-center">
                        <Badge className={cn(
                          "font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm",
                          entry.deposited ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {entry.deposited ? 'DEPOSITED' : 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right font-mono text-[10px] text-neutral-400">
                        {entry.challanNo || 'Not Filed'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="px-8 py-6 border-t border-neutral-50 flex items-center justify-between bg-neutral-50/30">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Showing {data.entries.length} of {data.total} Entries</p>
              <Pagination 
                currentPage={page} 
                totalPages={Math.ceil(data.total / 10)} 
                onPageChange={setPage} 
              />
            </div>
          </div>
        </div>
      )}
    </ReportContainer>
  );
}
