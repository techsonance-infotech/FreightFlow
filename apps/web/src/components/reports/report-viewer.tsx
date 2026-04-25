'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Download, Printer, Filter, Search, Calendar, ChevronLeft, ChevronRight, FileSpreadsheet, FileJson
} from 'lucide-react';
import { format } from 'date-fns';

interface ReportViewerProps {
  title: string;
  subtitle?: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    format?: (val: any) => React.ReactNode;
  }[];
  onFilterChange?: (filters: any) => void;
  isLoading?: boolean;
}

export function ReportViewer({ 
  title, 
  subtitle, 
  data, 
  columns, 
  onFilterChange,
  isLoading 
}: ReportViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(new Date().setDate(1), 'yyyy-MM-dd'), // Start of month
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="grid gap-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter records..."
                  className="pl-8 w-[250px] bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">Start Date</Label>
              <Input 
                type="date" 
                className="w-[180px] bg-background" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs uppercase text-muted-foreground font-bold">End Date</Label>
              <Input 
                type="date" 
                className="w-[180px] bg-background" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>

            <Button 
              variant="default" 
              onClick={() => onFilterChange?.(dateRange)}
              className="ml-auto"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {columns.map((col) => (
                    <TableHead key={col.key} className="font-bold text-xs uppercase tracking-wider">
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No records found matching filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, i) => (
                    <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {col.format ? col.format(row[col.key]) : row[col.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
