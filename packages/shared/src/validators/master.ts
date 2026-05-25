import { z } from 'zod';

export const DealerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Dealer name must be at least 3 characters'),
  code: z.string().optional().nullable().or(z.literal('')),
  shortName: z.string().optional().nullable().or(z.literal('')),
  personName: z.string().optional().nullable().or(z.literal('')),
  address: z.string().min(5, 'Full address is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().nullable().or(z.literal('')),
  area: z.string().optional().nullable().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits').optional().nullable().or(z.literal('')),
  email: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
  pan: z.string().regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN format').optional().nullable().or(z.literal('')),
  gstin: z.string().regex(/^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/, 'Invalid GSTIN format').optional().nullable().or(z.literal('')),
  serviceTaxNo: z.string().optional().nullable().or(z.literal('')),
  dealerType: z.string().optional().nullable().or(z.literal('')),

  // Bank Details
  bankName: z.string().optional().nullable().or(z.literal('')),
  accountNo: z.string().min(9, 'Bank account must be at least 9 digits').optional().nullable().or(z.literal('')),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format (e.g. SBIN0012345)').optional().nullable().or(z.literal('')),
  branchName: z.string().optional().nullable().or(z.literal('')),

  // Financials
  tdsRate: z.coerce.number().min(0).max(100).default(0),
  tdsSection: z.string().optional().nullable().or(z.literal('')),

  // Logistics Profile
  fleetSize: z.coerce.number().int().min(0).default(0),
  primaryRoutes: z.string().optional().nullable().or(z.literal('')),

  // Documents
  gstUrl: z.string().optional().nullable().or(z.literal('')),
  panUrl: z.string().optional().nullable().or(z.literal('')),
  bankProofUrl: z.string().optional().nullable().or(z.literal('')),

  isActive: z.boolean().default(true),
  isPalletReturn: z.boolean().default(false).optional(),
});

export type Dealer = z.infer<typeof DealerSchema>;

export const VehicleSchema = z.object({
  id: z.string().uuid().optional(),
  regNo: z.string().min(1, 'Registration number is required').regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,2}[0-9]{4}$/, 'Invalid registration number format (e.g. MH01AB1234)'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.enum(['Truck', 'Trailer', 'Tempo', 'Container', 'Other']).default('Truck'),
  ownership: z.enum(['Own', 'Hired']).default('Own'),
  
  // Technical Specs
  payloadKg: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? null : val, z.number().int().min(0, 'Payload must be positive').optional().nullable()),
  gvWKg: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? null : val, z.number().int().min(0, 'GVW must be positive').optional().nullable()),
  unladenWeightKg: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? null : val, z.number().int().min(0, 'Unladen weight must be positive').optional().nullable()),
  fuelType: z.enum(['Diesel', 'Petrol', 'CNG', 'EV', 'Other']).default('Diesel'),
  fuelCapacity: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? null : val, z.number().int().min(0).optional().nullable()),
  yom: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? null : val, z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable()),
  
  // Operational
  chassisNo: z.string().optional().nullable().or(z.literal('')),
  engineNo: z.string().optional().nullable().or(z.literal('')),
  odometer: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? 0 : val, z.number().int().min(0).default(0)),
  fastagNo: z.string().optional().nullable().or(z.literal('')),
  gpsProvider: z.string().optional().nullable().or(z.literal('')),
  imageUrl: z.string().optional().nullable().or(z.literal('')),
  
  // Ownership Details
  ownerName: z.string().optional().nullable().or(z.literal('')),
  purchaseDate: z.preprocess((val) => val === '' ? null : val, z.string().or(z.date()).optional().nullable()),
  purchaseAmount: z.preprocess((val) => (typeof val === 'number' && isNaN(val)) ? null : val, z.number().int().min(0).optional().nullable()), // stored in paise
  
  // Compliance
  rcNo: z.string().optional().nullable().or(z.literal('')),
  rcUrl: z.string().optional().nullable().or(z.literal('')),
  insuranceNo: z.string().optional().nullable().or(z.literal('')),
  insuranceExpiry: z.preprocess((val) => val === '' ? null : val, z.string().or(z.date()).optional().nullable()),
  insuranceUrl: z.string().optional().nullable().or(z.literal('')),
  fitnessExpiry: z.preprocess((val) => val === '' ? null : val, z.string().or(z.date()).optional().nullable()),
  
  // Assignment
  assignedDriverId: z.string().uuid().optional().nullable().or(z.literal('')).or(z.literal('unassigned')),
  
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export const ConsignorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  companyName: z.string().min(2, 'Sub-name must be at least 2 characters').optional().nullable().or(z.literal('')),
  address: z.string().min(5, 'Full address is required (min 5 chars)'),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  gstin: z.string().regex(/^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/, 'Invalid GSTIN format').optional().nullable().or(z.literal('')),
  pan: z.string().regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN format').optional().nullable().or(z.literal('')),
  
  // Credit & Financials
  creditLimit: z.coerce.number().min(0).default(0),
  creditDays: z.coerce.number().int().min(0).default(0),
  
  // MSME
  isMsme: z.boolean().default(false),
  msmeRegNo: z.string().optional().nullable().or(z.literal('')),
  
  // Documents
  imageUrl: z.string().optional().nullable().or(z.literal('')),
  gstUrl: z.string().optional().nullable().or(z.literal('')),
  panUrl: z.string().optional().nullable().or(z.literal('')),
  msmeUrl: z.string().optional().nullable().or(z.literal('')),
  
  isActive: z.boolean().default(true),
});

export type Consignor = z.infer<typeof ConsignorSchema>;

export const ConsigneeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  companyName: z.string().min(2, 'Sub-name must be at least 2 characters').optional().nullable().or(z.literal('')),
  address: z.string().min(5, 'Full address is required (min 5 chars)'),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits').optional().nullable().or(z.literal('')),
  gstin: z.string().regex(/^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/, 'Invalid GSTIN format').optional().nullable().or(z.literal('')),
  pan: z.string().regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, 'Invalid PAN format').optional().nullable().or(z.literal('')),
  
  // Credit & Financials
  creditLimit: z.coerce.number().min(0).default(0),
  creditDays: z.coerce.number().int().min(0).default(0),

  // MSME
  isMsme: z.boolean().default(false),
  msmeRegNo: z.string().optional().nullable().or(z.literal('')),
  
  // Logistics
  unloadingHours: z.string().optional().nullable().or(z.literal('')),
  restrictions: z.string().optional().nullable().or(z.literal('')),
  
  // Documents
  imageUrl: z.string().optional().nullable().or(z.literal('')),
  gstUrl: z.string().optional().nullable().or(z.literal('')),
  panUrl: z.string().optional().nullable().or(z.literal('')),
  msmeUrl: z.string().optional().nullable().or(z.literal('')),
  
  dealerIds: z.array(z.string().uuid()).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type Consignee = z.infer<typeof ConsigneeSchema>;

export const LabourObjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  phone: z.preprocess((val) => val === null ? '' : val, z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits')),
  address: z.preprocess((val) => val === null ? '' : val, z.string().min(1, 'Full address is required')),
  salary: z.number().int().positive('Salary must be greater than 0'), // in paise
  aadharNo: z.preprocess((val) => val === null ? '' : val, z.string().regex(/^\d{12}$/, 'Aadhar must be exactly 12 digits')),
  panNo: z.preprocess((val) => val === null ? '' : val, z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').optional().or(z.literal(''))),
  skillCategory: z.preprocess((val) => val === null ? '' : val, z.enum(['Driver', 'Loader', 'Cleaner', 'Mechanic', 'Other'], {
    errorMap: () => ({ message: 'Please select a skill category' })
  })),
  aadharUrl: z.string().optional().nullable(),
  panUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  // Driver specific (conditional validation via refine)
  dlNumber: z.string().optional().nullable().or(z.literal('')),
  dlExpiry: z.preprocess((val) => val === '' ? null : val, z.string().or(z.date()).optional().nullable()),
  dlCategory: z.string().optional().nullable().or(z.literal('')),
  badgeNo: z.string().optional().nullable().or(z.literal('')),
  dlUrl: z.string().optional().nullable().or(z.literal('')),

  // Bank Details
  bankName: z.string().optional().nullable().or(z.literal('')),
  accountNo: z.string().optional().nullable().or(z.literal('')),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format').optional().nullable().or(z.literal('')),
  branchName: z.string().optional().nullable().or(z.literal('')),
});

export const LabourSchema = LabourObjectSchema.refine((data) => {
  if (data.skillCategory === 'Driver') {
    return !!data.dlNumber && data.dlNumber.length > 5;
  }
  return true;
}, {
  message: "Driving License number is required for Drivers",
  path: ["dlNumber"]
}).refine((data) => {
  if (data.skillCategory === 'Driver') {
    if (!data.dlExpiry) return false;
    const expiry = new Date(data.dlExpiry);
    return expiry > new Date();
  }
  return true;
}, {
  message: "Valid future DL Expiry date is required for Drivers",
  path: ["dlExpiry"]
}).refine((data) => {
  if (data.skillCategory === 'Driver') {
    return !!data.dlCategory;
  }
  return true;
}, {
  message: "DL Category is required for Drivers",
  path: ["dlCategory"]
});

export type Labour = z.infer<typeof LabourObjectSchema>;

export const LabourAttendanceSchema = z.object({
  id: z.string().uuid().optional(),
  labourId: z.string().uuid(),
  date: z.string().or(z.date()),
  status: z.enum(['Present', 'Absent', 'HalfDay', 'Leave']),
  overtime: z.number().int().min(0).default(0),
  remarks: z.string().optional(),
});

export type LabourAttendance = z.infer<typeof LabourAttendanceSchema>;

export const ProductCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required'),
});

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const ProductUnitSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Unit name is required'),
});

export type ProductUnit = z.infer<typeof ProductUnitSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional().nullable(),
  categoryId: z.string().uuid('Please select a category'),
  unitId: z.string().uuid('Please select a base unit'),
  hsnCode: z.string().regex(/^\d{4}|\d{6}|\d{8}$/, 'HSN Code must be 4, 6 or 8 digits'),
  defaultPacking: z.string().optional().nullable(),
  gstRate: z.number({ 
    required_error: 'GST Rate is required',
    invalid_type_error: 'GST Rate must be a number'
  }).int('GST Rate must be a whole number').min(0, 'GST Rate cannot be negative'),
  imageUrl: z.string().optional().nullable(),
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

export const LabourExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  labourId: z.string().uuid(),
  type: z.enum(['Advance', 'Salary', 'Bonus', 'Deduction', 'Other']),
  amount: z.number().int().positive('Amount must be positive'), // in paise
  date: z.string().or(z.date()),
  message: z.string().min(1, 'Message/Remarks are required'),
  paymentMode: z.enum(['Cash', 'Bank', 'Online']).default('Cash'),
});

export type LabourExpense = z.infer<typeof LabourExpenseSchema>;

export const EmployeeTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  employeeId: z.string().uuid(),
  type: z.enum(['Advance', 'Salary', 'Bonus', 'Deduction', 'Other']),
  amount: z.number().int().positive('Amount must be positive'), // in paise
  date: z.string().or(z.date()),
  message: z.string().min(1, 'Message/Remarks are required'),
  paymentMode: z.enum(['Cash', 'Bank', 'Online']).default('Cash'),
});

export type EmployeeTransaction = z.infer<typeof EmployeeTransactionSchema>;

export const PalletMasterSchema = z.object({
  id: z.string().uuid().optional(),
  palletId: z.string().min(1, 'Pallet ID is required'),
  code: z.string().optional().nullable().or(z.literal('')),
  name: z.string().optional().nullable().or(z.literal('')),
  dimensions: z.string().optional().nullable().or(z.literal('')),
  weightCapacity: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type PalletMaster = z.infer<typeof PalletMasterSchema>;

