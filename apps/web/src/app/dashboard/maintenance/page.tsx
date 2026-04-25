'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Wrench, Calendar, ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vehicleId: '',
    jobType: 'scheduled',
    description: '',
    mechanicAssigned: '',
    odometer: '',
    estimatedCost: '',
    startedAt: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vRes, jRes] = await Promise.all([
        fetch('/api/v1/masters/vehicles'),
        fetch('/api/v1/fleet/maintenance'),
      ]);

      const vData = await vRes.json();
      const jData = await jRes.json();

      setVehicles(Array.isArray(vData) ? vData : []);
      setJobs(Array.isArray(jData) ? jData : []);
    } catch (error) {
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/fleet/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedCost: Math.round(parseFloat(formData.estimatedCost || '0') * 100),
          odometer: parseInt(formData.odometer),
        }),
      });

      if (!res.ok) throw new Error('Failed to create job card');

      toast.success('Maintenance job card created');
      setFormData({
        vehicleId: '',
        jobType: 'scheduled',
        description: '',
        mechanicAssigned: '',
        odometer: '',
        estimatedCost: '',
        startedAt: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/v1/fleet/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Status updated to ${status}`);
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Open</Badge>;
      case 'in_progress': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">In Progress</Badge>;
      case 'completed': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
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
          <h1 className="text-3xl font-bold tracking-tight">Fleet Maintenance</h1>
          <p className="text-muted-foreground">Manage job cards, repairs, and scheduled servicing.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Creation Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-primary" />
              New Job Card
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
                      <SelectItem key={v.id} value={v.id}>{v.regNo} - {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select 
                    value={formData.jobType} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, jobType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="breakdown">Breakdown</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={formData.startedAt} 
                    onChange={e => setFormData(prev => ({ ...prev, startedAt: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Service description or reported issues"
                  value={formData.description} 
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Odometer</Label>
                  <Input 
                    type="number" 
                    placeholder="Vehicle KM"
                    value={formData.odometer} 
                    onChange={e => setFormData(prev => ({ ...prev, odometer: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Est. Cost (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="Estimated"
                    value={formData.estimatedCost} 
                    onChange={e => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mechanic / Workshop Assigned</Label>
                <Input 
                  placeholder="Name of mechanic or garage"
                  value={formData.mechanicAssigned} 
                  onChange={e => setFormData(prev => ({ ...prev, mechanicAssigned: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Job Card
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Job List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Job Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Started On</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">No active maintenance jobs.</TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.vehicle?.regNo}</TableCell>
                        <TableCell className="capitalize">{job.jobType}</TableCell>
                        <TableCell>{format(new Date(job.startedAt), 'dd MMM yy')}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={job.description}>
                          {job.description}
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="text-right">
                          {job.status === 'open' && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(job.id, 'in_progress')}>
                              Start Work
                            </Button>
                          )}
                          {job.status === 'in_progress' && (
                            <Button size="sm" variant="default" onClick={() => updateStatus(job.id, 'completed')}>
                              Mark Done
                            </Button>
                          )}
                          {job.status === 'completed' && (
                            <Badge variant="outline" className="border-emerald-200 text-emerald-600">Finished</Badge>
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
