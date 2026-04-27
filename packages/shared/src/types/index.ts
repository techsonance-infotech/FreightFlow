// ============================================
// FreightFlow Pro — Shared Type Definitions
// ============================================

/** Tenant plan types */
export type TPlan = 'starter' | 'growth' | 'enterprise';

/** Tenant status */
export type TTenantStatus = 'active' | 'suspended' | 'expired';

/** User roles within a tenant */
export type TUserRole =
  | 'tenant_owner'
  | 'company_admin'
  | 'branch_manager'
  | 'accountant'
  | 'dispatcher'
  | 'hr_manager'
  | 'maintenance_supervisor'
  | 'staff'
  | 'driver';

/** LR/Order status flow */
export type TOrderStatus = 'created' | 'loaded' | 'in_transit' | 'delivered' | 'cancelled';

/** Vehicle status */
export type TVehicleStatus = 'active' | 'under_maintenance' | 'inactive';

/** Vehicle ownership type */
export type TVehicleOwnership = 'own' | 'hired';

/** Vehicle type */
export type TVehicleType = 'truck' | 'trailer' | 'tempo' | 'container' | 'other';

/** Rate calculation basis */
export type TRateOn = 'weight' | 'box';

/** Packing types */
export type TPackingType = 'box' | 'bag' | 'pallet' | 'loose' | 'bundle' | 'other';

/** Dealer types */
export type TDealerType = 'consignor' | 'broker' | 'direct' | 'other';

/** Tenant context injected into every request */
export interface TTenantContext {
  userId: string;
  tenantId: string;
  companyId: string;
  branchId?: string;
  role: TUserRole;
  enabledModules: string[];
}

/** License status response */
export interface TLicenseStatus {
  isActive: boolean;
  isGracePeriod: boolean;
  daysRemaining: number;
  plan: TPlan;
  currentUsage: {
    users: number;
    vehicles: number;
    lrCount: number;
  };
  planLimits: {
    maxUsers: number;
    maxVehicles: number;
  };
}

/** Pagination params */
export interface TPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/** Paginated response */
export interface TPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** API error response */
export interface TApiError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

/** API success response */
export interface TApiSuccess<T> {
  success: true;
  data: T;
}

export type TApiResponse<T> = TApiSuccess<T> | TApiError;
