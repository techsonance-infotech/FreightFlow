export type UserRole = 'super_admin' | 'tenant_owner' | 'fleet_owner' | 'ops_manager' | 'accountant' | 'hr_manager' | 'dispatch_officer' | 'maintenance_supervisor' | 'auditor' | 'driver';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  allowedRoles: UserRole[];
  subItems?: NavItem[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV_ITEMS: NavGroup[] = [
  {
    group: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard', allowedRoles: ['super_admin', 'tenant_owner', 'fleet_owner', 'ops_manager', 'accountant', 'hr_manager', 'dispatch_officer', 'maintenance_supervisor', 'auditor', 'driver'] },
    ]
  },
  {
    group: 'Operations',
    items: [
      { id: 'orders', label: 'Lorry Receipts (LR)', icon: '📦', path: '/dashboard/orders', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer'] },
      { id: 'pallets', label: 'Pallet Tracking', icon: '📥', path: '/dashboard/pallets', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer'] },
      { 
        id: 'trips', 
        label: 'Trip Management', 
        icon: '🛣️', 
        path: '/dashboard/trips', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer'],
        subItems: [
          { id: 'trips-active', label: 'Active Trips', icon: '🛣️', path: '/dashboard/trips', allowedRoles: ['tenant_owner', 'ops_manager'] },
          { id: 'trips-advances', label: 'Trip Advances', icon: '💸', path: '/dashboard/trips/advances', allowedRoles: ['tenant_owner', 'ops_manager', 'accountant'] },
        ]
      },
    ]
  },
  {
    group: 'Financials',
    items: [
      { 
        id: 'accounting', 
        label: 'Core Accounting', 
        icon: '📊', 
        path: '/dashboard/accounting', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'accountant', 'auditor'],
        subItems: [
          { id: 'accounting-ar', label: 'Receivables (AR)', icon: '📥', path: '/dashboard/accounting/ar', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'accounting-ap', label: 'Payables (AP)', icon: '📤', path: '/dashboard/accounting/ap', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'accounting-invoices', label: 'Sales Invoices', icon: '🧾', path: '/dashboard/accounting/invoices', allowedRoles: ['tenant_owner', 'accountant'] },
          { id: 'accounting-vouchers', label: 'Payment Vouchers', icon: '💸', path: '/dashboard/accounting/vouchers', allowedRoles: ['tenant_owner', 'accountant'] },
          { id: 'accounting-bank', label: 'Bank Recon', icon: '🏦', path: '/dashboard/accounting/bank', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'accounting-coa', label: 'Chart of Accounts', icon: '🗂️', path: '/dashboard/accounting/coa', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
        ]
      },
      { 
        id: 'compliance', 
        label: 'GST & Compliance', 
        icon: '⚖️', 
        path: '/dashboard/compliance', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'accountant', 'auditor'],
        subItems: [
          { id: 'compliance-gst', label: 'GSTR-1 Review', icon: '📊', path: '/dashboard/compliance/gst/gstr1', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'compliance-einvoice', label: 'e-Invoice Management', icon: '🧾', path: '/dashboard/compliance/gst/einvoice', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'compliance-tds', label: 'TDS Registers', icon: '✂️', path: '/dashboard/compliance/tds', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
        ]
      },
    ]
  },
  {
    group: 'Assets & HR',
    items: [
      { 
        id: 'hr', 
        label: 'HR & Payroll', 
        icon: '👥', 
        path: '/dashboard/hr', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'hr_manager'],
        subItems: [
          { id: 'hr-directory', label: 'Employee Directory', icon: '👥', path: '/dashboard/masters/employees', allowedRoles: ['tenant_owner', 'hr_manager'] },
          { id: 'hr-attendance', label: 'Attendance', icon: '📅', path: '/dashboard/hr/attendance', allowedRoles: ['tenant_owner', 'hr_manager'] },
          { id: 'hr-leaves', label: 'Leave Management', icon: '🌴', path: '/dashboard/hr/leaves', allowedRoles: ['tenant_owner', 'hr_manager'] },
          { id: 'hr-payroll', label: 'Payroll Processing', icon: '💸', path: '/dashboard/hr/payroll', allowedRoles: ['tenant_owner', 'hr_manager'] },
        ]
      },
      { 
        id: 'fleet-mgmt', 
        label: 'Fleet Management', 
        icon: '🚛', 
        path: '/dashboard/fleet', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'maintenance_supervisor'],
        subItems: [
          { id: 'fleet-registry', label: 'Vehicle Registry', icon: '🚚', path: '/dashboard/masters/vehicles', allowedRoles: ['tenant_owner', 'ops_manager', 'maintenance_supervisor'] },
          { id: 'fleet-compliance', label: 'Compliance Engine', icon: '🚨', path: '/dashboard/fleet/compliance', allowedRoles: ['tenant_owner', 'ops_manager', 'maintenance_supervisor'] },
          { id: 'fleet-docs', label: 'Manual Docs (Archive)', icon: '⚖️', path: '/dashboard/fleet/documents', allowedRoles: ['tenant_owner', 'maintenance_supervisor'] },
          { id: 'fleet-fuel', label: 'Fuel Tracking', icon: '⛽', path: '/dashboard/fuel', allowedRoles: ['tenant_owner', 'ops_manager', 'maintenance_supervisor'] },
          { id: 'fleet-maintenance', label: 'Maintenance Hub', icon: '🔧', path: '/dashboard/maintenance', allowedRoles: ['tenant_owner', 'maintenance_supervisor'] },
          { id: 'fleet-analytics', label: 'Vehicle Analytics', icon: '📈', path: '/dashboard/fleet/analytics', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager'] },
        ]
      },
    ]
  },
  {
    group: 'Intelligence',
    items: [
      { 
        id: 'reports', 
        label: 'Reports & BI', 
        icon: '📈', 
        path: '/dashboard/reports', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'accountant', 'auditor'],
        subItems: [
          { id: 'reports-transport', label: 'Transport Analytics', icon: '🚛', path: '/dashboard/reports/transport', allowedRoles: ['tenant_owner', 'ops_manager'] },
          { id: 'reports-financial', label: 'Financial Reports', icon: '💰', path: '/dashboard/reports/financial', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
        ]
      },
      {
        id: 'masters-dropdown',
        label: 'Master Registry',
        icon: '🏗️',
        path: '/dashboard/masters',
        allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'hr_manager', 'accountant'],
        subItems: [
          { id: 'masters-dealers', label: 'Dealers', icon: '🏢', path: '/dashboard/masters/dealers', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'accountant'] },
          { id: 'masters-consignees', label: 'Consignees', icon: '👥', path: '/dashboard/masters/consignees', allowedRoles: ['tenant_owner', 'ops_manager'] },
          { id: 'masters-consignors', label: 'Consignors', icon: '📤', path: '/dashboard/masters/consignors', allowedRoles: ['tenant_owner', 'ops_manager'] },
          { id: 'masters-drivers', label: 'Drivers', icon: '👷', path: '/dashboard/masters/drivers', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'hr_manager'] },
          { id: 'masters-products', label: 'Products', icon: '📦', path: '/dashboard/masters/products', allowedRoles: ['tenant_owner', 'ops_manager'] },
          { id: 'masters-labour', label: 'Labour Registry', icon: '👷', path: '/dashboard/masters/labour', allowedRoles: ['tenant_owner', 'fleet_owner', 'hr_manager', 'ops_manager'] },
        ]
      }
    ]
  }
];

export function hasPermission(userRole: string, allowedRoles: UserRole[]): boolean {
  if (userRole === 'super_admin') return true;
  return allowedRoles.includes(userRole as UserRole);
}
