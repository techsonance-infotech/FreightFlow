'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, Filter, Search, 
  Calendar as CalendarIcon, FileSpreadsheet, FileText, ChevronDown 
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface ReportViewerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onExport?: (format: 'excel' | 'pdf') => void;
  onFilterChange?: (filters: any) => void;
  isLoading?: boolean;
  filters?: React.ReactNode;
}

export function ReportViewer({ 
  title, 
  subtitle, 
  children, 
  onExport, 
  onFilterChange, 
  isLoading,
  filters
}: ReportViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm">
                <Download className="mr-2 h-4 w-4 text-accent-600" />
                Export
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={() => onExport?.('excel')} className="py-2 cursor-pointer">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('pdf')} className="py-2 cursor-pointer">
                <FileText className="mr-2 h-4 w-4 text-rose-500" />
                PDF Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
        </div>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search records..." 
                  className="pl-10 h-10 bg-neutral-50/50 border-none rounded-xl focus-visible:ring-accent-600/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {filters}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Activity className="h-3 w-3" />
              Live Report
              <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg">
                Verified
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 rounded-full border-4 border-neutral-100 border-t-accent-600 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Generating report data...</p>
              </div>
            ) : (
              children
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
