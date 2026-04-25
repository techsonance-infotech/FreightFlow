import { z } from 'zod';

export const DealerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  shortName: z.string().optional(),
  personName: z.string().min(1, 'Contact person name is required'),
  address: z.string().optional(),
  pincode: z.string().length(6, 'Pincode must be 6 digits').optional().or(z.literal('')),
  area: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal('')),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),
  serviceTaxNo: z.string().optional(),
  dealerType: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type Dealer = z.infer<typeof DealerSchema>;

export const VehicleSchema = z.object({
  id: z.string().uuid().optional(),
  regNo: z.string().min(1, 'Registration number is required'),
  make: z.string().optional(),
  model: z.string().optional(),
  type: z.enum(['Truck', 'Trailer', 'Tempo', 'Container', 'Other']).default('Truck'),
  ownership: z.enum(['Own', 'Hired']).default('Own'),
  chassisNo: z.string().optional(),
  engineNo: z.string().optional(),
  odometer: z.number().int().min(0).default(0),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export const ConsignorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  gstin: z.string().optional(),
  phone: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type Consignor = z.infer<typeof ConsignorSchema>;

export const ConsigneeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type Consignee = z.infer<typeof ConsigneeSchema>;

export const LabourSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  salary: z.number().int().min(0).default(0), // in paise
  isActive: z.boolean().default(true),
});

export type Labour = z.infer<typeof LabourSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  hsnCode: z.string().optional(),
  defaultPacking: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type Product = z.infer<typeof ProductSchema>;

export const DriverSchema = z.object({
  id: z.string().uuid().optional(),
  employeeId: z.string().uuid(),
  dlNumber: z.string().min(1, 'DL number is required'),
  dlExpiry: z.string().or(z.date()),
  dlCategory: z.string().optional(),
  badgeNo: z.string().optional(),
  isVendorDriver: z.boolean().default(false),
});

export type Driver = z.infer<typeof DriverSchema>;

export const EmployeeSchema = z.object({
  id: z.string().uuid().optional(),
  empCode: z.string().min(1, 'Employee code is required'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().or(z.date()).optional(),
  status: z.enum(['active', 'inactive', 'terminated']).default('active'),
  pan: z.string().optional(),
  bankAccount: z.string().optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

export const SalaryStructureSchema = z.object({
  id: z.string().uuid().optional(),
  employeeId: z.string().uuid(),
  basic: z.number().int().min(0).default(0),
  hra: z.number().int().min(0).default(0),
  conveyance: z.number().int().min(0).default(0),
  driverAllowance: z.number().int().min(0).default(0),
  otherAllowances: z.number().int().min(0).default(0),
  pfApplicable: z.boolean().default(true),
  esiApplicable: z.boolean().default(false),
  effectiveFrom: z.string().or(z.date()),
});

export type SalaryStructure = z.infer<typeof SalaryStructureSchema>;

