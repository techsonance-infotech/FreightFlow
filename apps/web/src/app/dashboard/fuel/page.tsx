'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Fuel, History, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function FuelPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuelEntries, setFuelEntries] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    vehicleId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    quantity: '',
    rate: '',
    amount: '',
    odometer: '',
    vendor: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vRes, fRes] = await Promise.all([
        fetch('/api/v1/masters/vehicles'),
        fetch('/api/v1/fleet/fuel'),
      ]);

      const vData = await vRes.json();
      const fData = await fRes.json();

      setVehicles(Array.isArray(vData) ? vData : []);
      setReport(fData);
      setFuelEntries(fData.entries || []);
    } catch (error) {
      toast.error('Failed to load fuel data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/fleet/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          rate: Math.round(parseFloat(formData.rate) * 100), // convert to paise
          amount: Math.round(parseFloat(formData.amount) * 100), // convert to paise
          odometer: parseInt(formData.odometer),
        }),
      });

      if (!res.ok) throw new Error('Failed to add fuel entry');

      toast.success('Fuel entry added successfully');
      setFormData({
        vehicleId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        quantity: '',
        rate: '',
        amount: '',
        odometer: '',
        vendor: '',
      });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Fuel Management</h1>
          <p className="text-muted-foreground">Track consumption, KMPL, and costs across your fleet.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Consumption</CardTitle>
            <Fuel className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.totalLitres?.toLocaleString() || 0} L</div>
            <p className="text-xs text-muted-foreground">Cumulative litres filled</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fleet Avg KMPL</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{report?.avgKmpl || 0}</div>
            <p className="text-xs text-muted-foreground">Efficiency benchmark</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <History className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₹ {(report?.totalCost / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total fuel expenditure</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Entry Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add Fuel Entry</CardTitle>
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
                      <SelectItem key={v.id} value={v.id}>{v.regNo} - {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Odometer</Label>
                  <Input 
                    type="number" 
                    placeholder="Current KM"
                    value={formData.odometer} 
                    onChange={e => setFormData(prev => ({ ...prev, odometer: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity (L)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formData.quantity} 
                    onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate (₹/L)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    value={formData.rate} 
                    onChange={e => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Amount (₹)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount} 
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Vendor / Pump Name</Label>
                <Input 
                  placeholder="Indian Oil, Shell, etc."
                  value={formData.vendor} 
                  onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Fuel Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Fuel Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>KMPL</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">No fuel entries found.</TableCell>
                    </TableRow>
                  ) : (
                    fuelEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{format(new Date(entry.date), 'dd MMM yy')}</TableCell>
                        <TableCell>{entry.vehicle?.regNo}</TableCell>
                        <TableCell>{entry.odometer.toLocaleString()} KM</TableCell>
                        <TableCell>{entry.quantity} L</TableCell>
                        <TableCell>
                          <span className={entry.isAnomaly ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium'}>
                            {entry.kmpl || '-'}
                          </span>
                        </TableCell>
                        <TableCell>₹ {(entry.amount / 100).toLocaleString()}</TableCell>
                        <TableCell>
                          {entry.isAnomaly && (
                            <div className="flex items-center text-red-500" title={entry.anomalyReason}>
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Anomaly</span>
                            </div>
                          )}
                          {!entry.isAnomaly && entry.kmpl && (
                            <span className="text-xs text-emerald-500 font-medium">Normal</span>
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
