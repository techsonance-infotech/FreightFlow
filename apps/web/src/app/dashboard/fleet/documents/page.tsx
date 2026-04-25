'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, FileText, CalendarClock, AlertCircle, FileUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function FleetDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vehicleId: '',
    docType: 'rc',
    docNo: '',
    issueDate: '',
    expiryDate: '',
    fileUrl: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes] = await Promise.all([
        fetch('/api/v1/masters/vehicles'),
        fetch('/api/v1/fleet/documents'),
      ]);

      const vData = await vRes.json();
      const dData = await dRes.json();

      setVehicles(Array.isArray(vData) ? vData : []);
      setDocuments(Array.isArray(dData) ? dData : []);
    } catch (error) {
      toast.error('Failed to load document data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/fleet/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save document');

      toast.success('Document recorded successfully');
      setFormData({
        vehicleId: '',
        docType: 'rc',
        docNo: '',
        issueDate: '',
        expiryDate: '',
        fileUrl: '',
      });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getExpiryStatus = (date: string) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 30) return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Expiring Soon ({days}d)</Badge>;
    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Valid</Badge>;
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Compliance</h1>
          <p className="text-muted-foreground">Monitor and manage all vehicle documents, renewals, and compliance.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileUp className="mr-2 h-5 w-5 text-primary" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select 
                  value={formData.vehicleId} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, vehicleId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.regNo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select 
                  value={formData.docType} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, docType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rc">Registration Certificate (RC)</SelectItem>
                    <SelectItem value="insurance">Insurance Policy</SelectItem>
                    <SelectItem value="fitness">Fitness Certificate</SelectItem>
                    <SelectItem value="puc">PUC Certificate</SelectItem>
                    <SelectItem value="permit">National/State Permit</SelectItem>
                    <SelectItem value="tax">Road Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document Number</Label>
                <Input 
                  placeholder="Enter policy/doc number"
                  value={formData.docNo} 
                  onChange={e => setFormData(prev => ({ ...prev, docNo: e.target.value }))}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input 
                    type="date" 
                    value={formData.issueDate} 
                    onChange={e => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input 
                    type="date" 
                    value={formData.expiryDate} 
                    onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>File URL (S3/Supabase)</Label>
                <Input 
                  placeholder="https://..."
                  value={formData.fileUrl} 
                  onChange={e => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Document
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Compliance Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Document No</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">No documents tracked yet.</TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.vehicle?.regNo}</TableCell>
                        <TableCell className="uppercase">{doc.docType}</TableCell>
                        <TableCell>{doc.docNo}</TableCell>
                        <TableCell>{format(new Date(doc.expiryDate), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{getExpiryStatus(doc.expiryDate)}</TableCell>
                        <TableCell className="text-right">
                          {doc.fileUrl ? (
                            <Button size="icon" variant="ghost" asChild>
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                                <FileText className="h-4 w-4 text-primary" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
