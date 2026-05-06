export type UserRole = 'super_admin' | 'tenant_owner' | 'fleet_owner' | 'ops_manager' | 'accountant' | 'hr_manager' | 'dispatch_officer' | 'maintenance_supervisor' | 'auditor' | 'driver';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  allowedRoles: UserRole[];
  category?: string;
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
      { id: 'support', label: 'Support', icon: '💬', path: '/dashboard/support', allowedRoles: ['super_admin', 'tenant_owner', 'fleet_owner', 'ops_manager', 'accountant', 'hr_manager', 'dispatch_officer', 'maintenance_supervisor', 'auditor', 'driver'] },
    ]
  },
  {
    group: 'Operations',
    items: [
      { id: 'orders', label: 'Lorry Receipts (LR)', icon: '📦', path: '/dashboard/orders', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer'], category: 'operations' },
      { id: 'pallets', label: 'Pallet Tracking', icon: '📥', path: '/dashboard/pallets', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer'], category: 'operations' },
      { 
        id: 'trips', 
        label: 'Trip Management', 
        icon: '🛣️', 
        path: '/dashboard/trips', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'dispatch_officer'],
        category: 'operations',
        subItems: [
          { id: 'trips-active', label: 'Active Trips', icon: '🛣️', path: '/dashboard/trips', allowedRoles: ['tenant_owner', 'ops_manager'] },
          { id: 'trips-pod', label: 'POD Dashboard', icon: '📸', path: '/dashboard/trips/pod', allowedRoles: ['tenant_owner', 'ops_manager', 'dispatch_officer'] },
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
        category: 'financials',
        subItems: [
          { id: 'accounting-dashboard', label: 'Intelligence Dashboard', icon: '📈', path: '/dashboard/accounting', allowedRoles: ['tenant_owner', 'fleet_owner', 'accountant', 'auditor'] },
          { id: 'accounting-ar', label: 'Receivables (AR)', icon: '📥', path: '/dashboard/accounting/ar', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'accounting-ap', label: 'Payables (AP)', icon: '📤', path: '/dashboard/accounting/ap', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'accounting-invoices', label: 'Sales Invoices', icon: '🧾', path: '/dashboard/accounting/invoices', allowedRoles: ['tenant_owner', 'accountant'] },
          { id: 'accounting-vouchers', label: 'Accounting Vouchers', icon: '💸', path: '/dashboard/accounting/vouchers', allowedRoles: ['tenant_owner', 'accountant'] },
          { id: 'accounting-bank', label: 'Bank Recon', icon: '🏦', path: '/dashboard/accounting/reconciliation', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'accounting-reports', label: 'Financial Stmts', icon: '📜', path: '/dashboard/accounting/reports', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'accounting-coa', label: 'Chart of Accounts', icon: '🗂️', path: '/dashboard/accounting/coa', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
        ]
      },
      { 
        id: 'compliance', 
        label: 'GST & Compliance', 
        icon: '⚖️', 
        path: '/dashboard/compliance', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'accountant', 'auditor'],
        category: 'compliance',
        subItems: [
          { id: 'compliance-hub', label: 'Compliance Hub', icon: '🏛️', path: '/dashboard/compliance', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'compliance-gst', label: 'GSTR-1 Review', icon: '📊', path: '/dashboard/compliance/gst/gstr1', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'compliance-gst3b', label: 'GSTR-3B Summary', icon: '🧮', path: '/dashboard/compliance/gst/gstr3b', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'compliance-einvoice', label: 'e-Invoice Management', icon: '🧾', path: '/dashboard/compliance/gst/einvoice', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
          { id: 'compliance-tax', label: 'Tax Center', icon: '🏛️', path: '/dashboard/accounting/tax', allowedRoles: ['tenant_owner', 'accountant', 'auditor'] },
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
        category: 'hr',
        subItems: [
          { id: 'hr-directory', label: 'Employee Directory', icon: '👥', path: '/dashboard/masters/employees', allowedRoles: ['tenant_owner', 'hr_manager'], category: 'hr' },
          { id: 'hr-attendance', label: 'Attendance', icon: '📅', path: '/dashboard/hr/attendance', allowedRoles: ['tenant_owner', 'hr_manager'], category: 'hr' },
          { id: 'hr-leaves', label: 'Leave Management', icon: '🌴', path: '/dashboard/hr/leaves', allowedRoles: ['tenant_owner', 'hr_manager'], category: 'hr' },
          { id: 'hr-payroll', label: 'Payroll Processing', icon: '💸', path: '/dashboard/hr/payroll', allowedRoles: ['tenant_owner', 'hr_manager'], category: 'hr' },
        ]
      },
      { 
        id: 'fleet-mgmt', 
        label: 'Fleet Management', 
        icon: '🚛', 
        path: '/dashboard/fleet', 
        allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'maintenance_supervisor'],
        category: 'fleet',
        subItems: [
          { id: 'fleet-registry', label: 'Vehicle Registry', icon: '🚚', path: '/dashboard/masters/vehicles', allowedRoles: ['tenant_owner', 'ops_manager', 'maintenance_supervisor'], category: 'fleet' },
          { id: 'fleet-compliance', label: 'Compliance Engine', icon: '🚨', path: '/dashboard/fleet/compliance', allowedRoles: ['tenant_owner', 'ops_manager', 'maintenance_supervisor'], category: 'fleet' },
          { id: 'fleet-docs', label: 'Manual Docs (Archive)', icon: '⚖️', path: '/dashboard/fleet/documents', allowedRoles: ['tenant_owner', 'maintenance_supervisor'], category: 'fleet' },
          { id: 'fleet-fuel', label: 'Fuel Tracking', icon: '⛽', path: '/dashboard/fuel', allowedRoles: ['tenant_owner', 'ops_manager', 'maintenance_supervisor'], category: 'fleet' },
          { id: 'fleet-tyres', label: 'Tyre Tracking', icon: '⭕', path: '/dashboard/fleet/tyres', allowedRoles: ['tenant_owner', 'ops_manager', 'maintenance_supervisor'], category: 'fleet' },
          { id: 'fleet-maintenance', label: 'Maintenance Hub', icon: '🔧', path: '/dashboard/maintenance', allowedRoles: ['tenant_owner', 'maintenance_supervisor'], category: 'fleet' },
          { id: 'fleet-schedules', label: 'Service Schedules', icon: '📅', path: '/dashboard/maintenance/schedules', allowedRoles: ['tenant_owner', 'maintenance_supervisor'], category: 'fleet' },
          { id: 'fleet-analytics', label: 'Vehicle Analytics', icon: '📈', path: '/dashboard/fleet/analytics', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager'], category: 'fleet' },
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
        category: 'intelligence',
        subItems: [
          { id: 'reports-transport', label: 'Transport Analytics', icon: '🚛', path: '/dashboard/reports/transport', allowedRoles: ['tenant_owner', 'ops_manager'], category: 'intelligence' },
          { id: 'reports-routes', label: 'Route Profitability', icon: '🛣️', path: '/dashboard/reports/routes', allowedRoles: ['tenant_owner', 'ops_manager', 'accountant'], category: 'intelligence' },
          { id: 'reports-financial', label: 'Financial Reports', icon: '💰', path: '/dashboard/reports/financial', allowedRoles: ['tenant_owner', 'accountant', 'auditor'], category: 'intelligence' },
          { id: 'reports-automation', label: 'Report Automation', icon: '🤖', path: '/dashboard/reports/scheduler', allowedRoles: ['tenant_owner', 'ops_manager', 'accountant'], category: 'intelligence' },
        ]
      },
      {
        id: 'masters-dropdown',
        label: 'Master Registry',
        icon: '🏗️',
        path: '/dashboard/masters',
        allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'hr_manager', 'accountant'],
        category: 'masters',
        subItems: [
          { id: 'masters-dealers', label: 'Dealers', icon: '🏢', path: '/dashboard/masters/dealers', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'accountant'], category: 'masters' },
          { id: 'masters-consignees', label: 'Consignees', icon: '👥', path: '/dashboard/masters/consignees', allowedRoles: ['tenant_owner', 'ops_manager'], category: 'masters' },
          { id: 'masters-consignors', label: 'Consignors', icon: '📤', path: '/dashboard/masters/consignors', allowedRoles: ['tenant_owner', 'ops_manager'], category: 'masters' },
          { id: 'masters-drivers', label: 'Drivers', icon: '👷', path: '/dashboard/masters/drivers', allowedRoles: ['tenant_owner', 'fleet_owner', 'ops_manager', 'hr_manager'], category: 'masters' },
          { id: 'masters-products', label: 'Products', icon: '📦', path: '/dashboard/masters/products', allowedRoles: ['tenant_owner', 'ops_manager'], category: 'masters' },
          { id: 'masters-labour', label: 'Labour Registry', icon: '👷', path: '/dashboard/masters/labour', allowedRoles: ['tenant_owner', 'fleet_owner', 'hr_manager', 'ops_manager'], category: 'masters' },
        ]
      }
    ]
  },
  {
    group: 'Admin',
    items: [
      { 
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        path: '/dashboard/settings',
        allowedRoles: ['tenant_owner', 'fleet_owner', 'hr_manager'],
        category: 'admin',
        subItems: [
          { id: 'settings-org', label: 'Organization', icon: '🏢', path: '/dashboard/settings/organization', allowedRoles: ['tenant_owner', 'fleet_owner'], category: 'admin' },
          { id: 'settings-business', label: 'Business Config', icon: '⚙️', path: '/dashboard/settings/business', allowedRoles: ['tenant_owner', 'fleet_owner'], category: 'admin' },
          { id: 'settings-branding', label: 'Branding', icon: '🎨', path: '/dashboard/settings/branding', allowedRoles: ['tenant_owner', 'fleet_owner'], category: 'admin' },
          { id: 'settings-users', label: 'Users & Team', icon: '👥', path: '/dashboard/settings/users', allowedRoles: ['tenant_owner', 'fleet_owner', 'hr_manager'], category: 'admin' },
          { id: 'settings-audit', label: 'Audit Trail', icon: '📜', path: '/dashboard/settings/audit-log', allowedRoles: ['tenant_owner', 'fleet_owner'], category: 'admin' },
          { id: 'settings-security', label: 'Security', icon: '🛡️', path: '/dashboard/settings/security', allowedRoles: ['tenant_owner', 'fleet_owner'], category: 'admin' },
          { id: 'settings-billing', label: 'Billing', icon: '💳', path: '/dashboard/settings/billing', allowedRoles: ['tenant_owner', 'fleet_owner'], category: 'admin' },
        ]
      }
    ]
  }
];

export const NAV_CATEGORIES = [
  { id: 'operations', label: 'Operations & Trips' },
  { id: 'financials', label: 'Core Accounting' },
  { id: 'compliance', label: 'GST & Compliance' },
  { id: 'hr', label: 'HR & Payroll' },
  { id: 'fleet', label: 'Fleet & Assets' },
  { id: 'intelligence', label: 'BI & Reports' },
  { id: 'masters', label: 'Master Registry' },
];

export function hasPermission(userRole: string, item: NavItem, permissions?: any): boolean {
  if (userRole === 'super_admin' || userRole === 'tenant_owner') return true;
  
  // 1. Check Role-based permission
  const hasRoleAccess = item.allowedRoles.includes(userRole as UserRole);
  if (!hasRoleAccess) return false;

  // 2. Check for granular blocks (Overrides)
  if (permissions?.blockedModules && Array.isArray(permissions.blockedModules)) {
    if (item.category && permissions.blockedModules.includes(item.category)) {
      return false;
    }
  }

  return true;
}

export function findNavItemByPath(path: string): NavItem | null {
  for (const group of NAV_ITEMS) {
    const findInItems = (items: NavItem[]): NavItem | null => {
      for (const item of items) {
        if (item.path === path) return item;
        if (item.subItems) {
          const found = findInItems(item.subItems);
          if (found) return found;
        }
      }
      return null;
    };
    const found = findInItems(group.items);
    if (found) return found;
  }
  return null;
}
