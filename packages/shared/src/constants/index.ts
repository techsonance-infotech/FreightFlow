// ============================================
// FreightFlow Pro — Module Keys & Constants
// ============================================

/** All module keys in the system */
export const MODULE_KEYS = {
  CORE_ACCOUNTING: 'mod_core_accounting',
  FREIGHT_BILLING: 'mod_freight_billing',
  LR_MANAGEMENT: 'mod_lr_management',
  PALLET_MANAGEMENT: 'mod_pallet_management',
  TRIP_MANAGEMENT: 'mod_trip_management',
  FLEET: 'mod_fleet',
  MAINTENANCE: 'mod_maintenance',
  FUEL: 'mod_fuel',
  HR_PAYROLL: 'mod_hr_payroll',
  DRIVER_ADVANCE: 'mod_driver_advance',
  GST_COMPLIANCE: 'mod_gst_compliance',
  TDS: 'mod_tds',
  CRM: 'mod_crm',
  AI_ANALYTICS: 'mod_ai_analytics',
  DISPATCH_BOARD: 'mod_dispatch_board',
  MOBILE_DRIVER: 'mod_mobile_driver',
  MULTI_COMPANY: 'mod_multi_company',
  API_ACCESS: 'mod_api_access',
  WHATSAPP: 'mod_whatsapp',
} as const;

export type TModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];

/** Default modules per plan */
export const PLAN_DEFAULTS: Record<string, { modules: TModuleKey[]; maxUsers: number; maxVehicles: number }> = {
  starter: {
    maxUsers: 5,
    maxVehicles: 20,
    modules: [
      MODULE_KEYS.CORE_ACCOUNTING,
      MODULE_KEYS.FREIGHT_BILLING,
      MODULE_KEYS.LR_MANAGEMENT,
      MODULE_KEYS.PALLET_MANAGEMENT,
      MODULE_KEYS.TRIP_MANAGEMENT,
      MODULE_KEYS.FLEET,
      MODULE_KEYS.MAINTENANCE,
      MODULE_KEYS.FUEL,
      MODULE_KEYS.HR_PAYROLL,
      MODULE_KEYS.DRIVER_ADVANCE,
      MODULE_KEYS.GST_COMPLIANCE,
      MODULE_KEYS.TDS,
      MODULE_KEYS.DISPATCH_BOARD,
      MODULE_KEYS.MOBILE_DRIVER,
    ],
  },
  growth: {
    maxUsers: 25,
    maxVehicles: 100,
    modules: [
      MODULE_KEYS.CORE_ACCOUNTING,
      MODULE_KEYS.FREIGHT_BILLING,
      MODULE_KEYS.LR_MANAGEMENT,
      MODULE_KEYS.PALLET_MANAGEMENT,
      MODULE_KEYS.TRIP_MANAGEMENT,
      MODULE_KEYS.FLEET,
      MODULE_KEYS.MAINTENANCE,
      MODULE_KEYS.FUEL,
      MODULE_KEYS.HR_PAYROLL,
      MODULE_KEYS.DRIVER_ADVANCE,
      MODULE_KEYS.GST_COMPLIANCE,
      MODULE_KEYS.TDS,
      MODULE_KEYS.DISPATCH_BOARD,
      MODULE_KEYS.MOBILE_DRIVER,
      MODULE_KEYS.MULTI_COMPANY,
      MODULE_KEYS.WHATSAPP,
    ],
  },
  enterprise: {
    maxUsers: 999,
    maxVehicles: 999,
    modules: Object.values(MODULE_KEYS),
  },
};

/** LR status flow */
export const ORDER_STATUS_FLOW = ['created', 'loaded', 'in_transit', 'delivered', 'cancelled'] as const;

/** Status display config */
export const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  created: { label: 'Created', bg: '#ECEFF1', color: '#607D8B' },
  loaded: { label: 'Loaded', bg: '#E3F2FD', color: '#1565C0' },
  in_transit: { label: 'In Transit', bg: '#E3F2FD', color: '#1565C0' },
  delivered: { label: 'Delivered', bg: '#E8F5E9', color: '#2E7D32' },
  cancelled: { label: 'Cancelled', bg: '#ECEFF1', color: '#607D8B' },
  pending: { label: 'Pending', bg: '#FFF3E0', color: '#E65100' },
  overdue: { label: 'Overdue', bg: '#FFEBEE', color: '#C62828' },
  paid: { label: 'Paid', bg: '#E8F5E9', color: '#2E7D32' },
  partial: { label: 'Partial', bg: '#E1F5FE', color: '#0277BD' },
  draft: { label: 'Draft', bg: '#ECEFF1', color: '#90A4AE' },
  pod_pending: { label: 'POD Pending', bg: '#FFF8E1', color: '#F57F17' },
};

/** Packing type options */
export const PACKING_TYPES = ['box', 'bag', 'pallet', 'loose', 'bundle', 'other'] as const;

/** Indian state codes for GST */
export const INDIAN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '29': 'Karnataka',
  '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
  '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar',
  '36': 'Telangana', '37': 'Andhra Pradesh',
};
