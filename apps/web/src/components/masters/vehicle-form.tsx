'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VehicleSchema, type Vehicle, type Labour } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadMasterDocument } from '@/app/actions/masters/labour';
import { 
  Truck, Factory, Layers, Calendar, Package, Scale, 
  Feather, Fuel, Gauge, User, IndianRupee, Hash, 
  Settings, Scroll, Contact, ShieldCheck, Milestone, MapPin,
  Camera, FileText, CheckCircle2, X
} from 'lucide-react';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSuccess: (data: Vehicle) => void;
  onCancel: () => void;
}

export function VehicleForm({ initialData, onSuccess, onCancel }: VehicleFormProps) {
  const isEditing = !!initialData?.id;
  const [drivers, setDrivers] = useState<Labour[]>([]);
  const [vehicleImage, setVehicleImage] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Vehicle>({
    resolver: zodResolver(VehicleSchema) as any,
    defaultValues: {
      status: 'active',
      type: 'Truck',
      ownership: 'Own',
      fuelType: 'Diesel',
      odometer: 0,
      ...initialData,
      purchaseAmount: initialData?.purchaseAmount ? initialData.purchaseAmount / 100 : 0,
      purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
      insuranceExpiry: initialData?.insuranceExpiry ? new Date(initialData.insuranceExpiry).toISOString().split('T')[0] : '',
      fitnessExpiry: initialData?.fitnessExpiry ? new Date(initialData.fitnessExpiry).toISOString().split('T')[0] : '',
      assignedDriverId: initialData?.assignedDriverId || 'unassigned',
    },
  });

  useEffect(() => {
    // Fetch drivers for assignment
    const fetchDrivers = async () => {
      try {
        const res = await fetch('/api/v1/masters/labour?skillCategory=Driver&limit=100');
        const result = await res.json();
        if (res.ok) setDrivers(result.data);
      } catch (err) {
        console.error('Failed to fetch drivers');
      }
    };
    fetchDrivers();
  }, []);

  const onSubmit = async (data: Vehicle) => {
    setUploading(true);
    try {
      const vehicleId = initialData?.id;
      const uploads: Record<string, any> = {};

      // 1. Handle Document Uploads (If vehicle ID exists)
      if (vehicleId) {
        if (vehicleImage) {
          if (vehicleImage.size > 1024 * 1024) throw new Error('Vehicle Photo must be less than 1MB');
          const formData = new FormData();
          formData.append('file', vehicleImage);
          formData.append('type', 'vehicle_photo');
          formData.append('masterId', vehicleId);
          formData.append('masterType', 'vehicle');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`Image Upload: ${res.error}`);
          if (res.publicUrl) uploads.imageUrl = res.publicUrl;
        }

        if (rcFile) {
          if (rcFile.size > 1024 * 1024) throw new Error('RC Document must be less than 1MB');
          const formData = new FormData();
          formData.append('file', rcFile);
          formData.append('type', 'rc_doc');
          formData.append('masterId', vehicleId);
          formData.append('masterType', 'vehicle');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`RC Upload: ${res.error}`);
          if (res.publicUrl) uploads.rcUrl = res.publicUrl;
        }

        if (insuranceFile) {
          if (insuranceFile.size > 1024 * 1024) throw new Error('Insurance Document must be less than 1MB');
          const formData = new FormData();
          formData.append('file', insuranceFile);
          formData.append('type', 'insurance_doc');
          formData.append('masterId', vehicleId);
          formData.append('masterType', 'vehicle');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`Insurance Upload: ${res.error}`);
          if (res.publicUrl) uploads.insuranceUrl = res.publicUrl;
        }
      }

      // 2. Prepare Payload
      const payload = {
        ...data,
        assignedDriverId: data.assignedDriverId === 'unassigned' ? null : data.assignedDriverId,
        purchaseAmount: data.purchaseAmount ? Math.round(data.purchaseAmount * 100) : null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : null,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry).toISOString() : null,
        fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry).toISOString() : null,
        ...uploads
      };

      const url = isEditing ? `/api/v1/masters/vehicles/${initialData.id}` : '/api/v1/masters/vehicles';
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save vehicle');
      }

      let savedData = await response.json();

      // 3. Handle Uploads for NEW vehicle
      if (!isEditing) {
        const postUploads: Record<string, any> = {};

        if (vehicleImage) {
          if (vehicleImage.size > 1024 * 1024) throw new Error('Vehicle Photo must be less than 1MB');
          const formData = new FormData();
          formData.append('file', vehicleImage);
          formData.append('type', 'vehicle_photo');
          formData.append('masterId', savedData.id);
          formData.append('masterType', 'vehicle');
          
          const res = await uploadMasterDocument(formData);
          if (res.success && res.publicUrl) postUploads.imageUrl = res.publicUrl;
        }

        if (rcFile) {
          if (rcFile.size > 1024 * 1024) throw new Error('RC Document must be less than 1MB');
          const formData = new FormData();
          formData.append('file', rcFile);
          formData.append('type', 'rc_doc');
          formData.append('masterId', savedData.id);
          formData.append('masterType', 'vehicle');
          
          const res = await uploadMasterDocument(formData);
          if (res.success && res.publicUrl) postUploads.rcUrl = res.publicUrl;
        }

        if (insuranceFile) {
          if (insuranceFile.size > 1024 * 1024) throw new Error('Insurance Document must be less than 1MB');
          const formData = new FormData();
          formData.append('file', insuranceFile);
          formData.append('type', 'insurance_doc');
          formData.append('masterId', savedData.id);
          formData.append('masterType', 'vehicle');
          
          const res = await uploadMasterDocument(formData);
          if (res.success && res.publicUrl) postUploads.insuranceUrl = res.publicUrl;
        }

        if (Object.keys(postUploads).length > 0) {
          const updateRes = await fetch(`/api/v1/masters/vehicles/${savedData.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postUploads),
          });
          if (updateRes.ok) savedData = await updateRes.json();
        }
      }

      toast.success(isEditing ? 'Vehicle updated' : 'Vehicle registered');
      onSuccess(savedData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const onError = (errors: any) => {
    console.error('Validation errors:', errors);
    toast.error('Please check all tabs and fix the validation errors.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100 rounded-2xl p-1 mb-8 h-12">
          <TabsTrigger value="general" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Identity</TabsTrigger>
          <TabsTrigger value="technical" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Technical</TabsTrigger>
          <TabsTrigger value="ownership" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Ownership</TabsTrigger>
          <TabsTrigger value="compliance" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Compliance</TabsTrigger>
          <TabsTrigger value="operations" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Registration Number *" placeholder="e.g. MH01AB1234" icon={<Truck className="h-4 w-4" />} error={errors.regNo?.message} {...register('regNo')} />
            <Input label="Make *" placeholder="e.g. Tata" icon={<Factory className="h-4 w-4" />} error={errors.make?.message} {...register('make')} />
            <Input label="Model *" placeholder="e.g. Signa 4825" icon={<Layers className="h-4 w-4" />} error={errors.model?.message} {...register('model')} />
            <Input label="Year of Mfg" type="number" placeholder="e.g. 2023" icon={<Calendar className="h-4 w-4" />} error={errors.yom?.message} {...register('yom', { valueAsNumber: true })} />
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Vehicle Type</label>
              <Select value={watch('type')} onValueChange={(val) => setValue('type', val as any)}>
                <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-900">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Trailer">Trailer</SelectItem>
                  <SelectItem value="Tempo">Tempo</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Ownership</label>
              <Select value={watch('ownership')} onValueChange={(val) => setValue('ownership', val as any)}>
                <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-900">
                  <SelectValue placeholder="Select Ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Own">Own</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Payload Capacity (Kg)" type="number" icon={<Package className="h-4 w-4" />} error={errors.payloadKg?.message} {...register('payloadKg', { valueAsNumber: true })} />
            <Input label="Gross Vehicle Weight (Kg)" type="number" icon={<Scale className="h-4 w-4" />} error={errors.gvWKg?.message} {...register('gvWKg', { valueAsNumber: true })} />
            <Input label="Unladen Weight (Kg)" type="number" icon={<Feather className="h-4 w-4" />} error={errors.unladenWeightKg?.message} {...register('unladenWeightKg', { valueAsNumber: true })} />
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fuel Type</label>
              <Select value={watch('fuelType')} onValueChange={(val) => setValue('fuelType', val as any)}>
                <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-900">
                  <SelectValue placeholder="Select Fuel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="CNG">CNG</SelectItem>
                  <SelectItem value="EV">Electric (EV)</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input label="Fuel Tank Capacity (L)" type="number" icon={<Fuel className="h-4 w-4" />} error={errors.fuelCapacity?.message} {...register('fuelCapacity', { valueAsNumber: true })} />
            <Input label="Current Odometer (km)" type="number" icon={<Gauge className="h-4 w-4" />} error={errors.odometer?.message} {...register('odometer', { valueAsNumber: true })} />
          </div>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Owner/Leaser Name" placeholder="Full name of legal owner" icon={<User className="h-4 w-4" />} error={errors.ownerName?.message} {...register('ownerName')} />
            <Input label="Purchase Date" type="date" icon={<Calendar className="h-4 w-4" />} error={errors.purchaseDate?.message} {...register('purchaseDate')} />
            <Input label="Purchase Amount (₹)" type="number" step="0.01" icon={<IndianRupee className="h-4 w-4" />} error={errors.purchaseAmount?.message} {...register('purchaseAmount', { valueAsNumber: true })} />
            <Input label="Chassis Number" placeholder="Chassis No" icon={<Hash className="h-4 w-4" />} error={errors.chassisNo?.message} {...register('chassisNo')} />
            <Input label="Engine Number" placeholder="Engine No" icon={<Settings className="h-4 w-4" />} error={errors.engineNo?.message} {...register('engineNo')} />
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <div className="grid grid-cols-1 gap-8">
            <div className="p-6 rounded-3xl bg-blue-50/30 border border-blue-100 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                <Scroll className="h-4 w-4" /> Registration & Insurance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="RC Number" placeholder="Registration Doc No" icon={<Contact className="h-4 w-4" />} error={errors.rcNo?.message} {...register('rcNo')} />
                <Input label="Insurance Policy No" placeholder="Policy Number" icon={<ShieldCheck className="h-4 w-4" />} error={errors.insuranceNo?.message} {...register('insuranceNo')} />
                <Input label="Insurance Expiry" type="date" icon={<Calendar className="h-4 w-4" />} error={errors.insuranceExpiry?.message} {...register('insuranceExpiry')} />
                <Input label="Fitness Expiry" type="date" icon={<Calendar className="h-4 w-4" />} error={errors.fitnessExpiry?.message} {...register('fitnessExpiry')} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-blue-100/50">
                <div className="space-y-3">
                  <label className="cursor-pointer">
                    <div className={`p-6 rounded-3xl bg-white border-2 border-dashed transition-all group ${
                      rcFile ? 'border-green-300 bg-green-50/30' : 'border-blue-100 hover:border-blue-300'
                    }`}>
                      <div className="flex flex-col items-center text-center">
                        <div className="text-slate-400 mb-2 group-hover:scale-110 transition-transform">{rcFile ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <FileText className="h-6 w-6" />}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {rcFile ? rcFile.name : 'Upload RC Book'}
                        </p>
                        <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">PDF or Image (Max 1MB)</p>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.size > 1024 * 1024) {
                              toast.error('RC Document must be less than 1MB');
                              return;
                            }
                            setRcFile(file || null);
                          }}
                        />
                      </div>
                    </div>
                  </label>
                  {initialData?.rcUrl && !rcFile && (
                    <div className="flex items-center justify-between px-4 py-2 bg-white rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-green-600 tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> RC Uploaded</p>
                      <a href={initialData.rcUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 underline">VIEW DOC</a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="cursor-pointer">
                    <div className={`p-6 rounded-3xl bg-white border-2 border-dashed transition-all group ${
                      insuranceFile ? 'border-green-300 bg-green-50/30' : 'border-blue-100 hover:border-blue-300'
                    }`}>
                      <div className="flex flex-col items-center text-center">
                        <div className="text-slate-400 mb-2 group-hover:scale-110 transition-transform">{insuranceFile ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <ShieldCheck className="h-6 w-6" />}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {insuranceFile ? insuranceFile.name : 'Upload Policy Doc'}
                        </p>
                        <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">PDF or Image (Max 1MB)</p>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.size > 1024 * 1024) {
                              toast.error('Insurance Document must be less than 1MB');
                              return;
                            }
                            setInsuranceFile(file || null);
                          }}
                        />
                      </div>
                    </div>
                  </label>
                  {initialData?.insuranceUrl && !insuranceFile && (
                    <div className="flex items-center justify-between px-4 py-2 bg-white rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-green-600 tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Policy Uploaded</p>
                      <a href={initialData.insuranceUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 underline">VIEW DOC</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Assigned Driver</label>
              <Select value={watch('assignedDriverId') || ''} onValueChange={(val) => setValue('assignedDriverId', val)}>
                <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl font-bold text-slate-900">
                  <SelectValue placeholder="Select Driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {drivers.map(d => (
                    <SelectItem key={d.id} value={d.id!}>{d.name} ({d.phone})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Input label="Fastag ID" placeholder="TID/Wallet ID" icon={<Milestone className="h-4 w-4" />} error={errors.fastagNo?.message} {...register('fastagNo')} />
            <Input label="GPS Provider" placeholder="e.g. Samsara, Fleetio" icon={<MapPin className="h-4 w-4" />} error={errors.gpsProvider?.message} {...register('gpsProvider')} />
            
            <div className="col-span-full pt-4">
              <label className="cursor-pointer group">
                <div className={`p-8 rounded-3xl bg-slate-50 border-2 border-dashed transition-all ${
                  vehicleImage ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100 hover:border-blue-300'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                      {vehicleImage ? <CheckCircle2 className="h-8 w-8 text-emerald-500" /> : <Camera className="h-8 w-8" />}
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                      {vehicleImage ? vehicleImage.name : 'Upload Vehicle Photo'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                      PDF or Image (Max 1MB)
                    </p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size > 1024 * 1024) {
                          toast.error('Vehicle Photo must be less than 1MB');
                          return;
                        }
                        setVehicleImage(file || null);
                      }}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-xl h-12 w-12 hover:bg-slate-100 text-slate-400">
          <X className="h-5 w-5" />
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading}
          className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-8 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-blue-100"
        >
          {isSubmitting || uploading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (isEditing ? 'Update Vehicle' : 'Register Vehicle')}
        </Button>
      </div>
    </form>
  );
}
