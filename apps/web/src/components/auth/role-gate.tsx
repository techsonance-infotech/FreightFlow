'use client';

import React from 'react';
import { type UserRole } from '@/config/rbac';

interface RoleGateProps {
  /** Current user's role */
  userRole: string;
  /** Roles allowed to see the children */
  allowedRoles: UserRole[];
  /** Optional user permissions for granular overrides */
  permissions?: any;
  /** Optional category to check against blockedModules */
  category?: string;
  /** Content to show if access is denied. If not provided, renders nothing. */
  fallback?: React.ReactNode;
  /** The protected content */
  children: React.ReactNode;
}

/**
 * RoleGate — A wrapper component to conditionally render UI based on the user's
 * role and optionally their granular module permissions. Use this to hide/show
 * buttons, sections, or entire panels that should only be visible to specific roles.
 *
 * @example
 * ```tsx
 * <RoleGate userRole={user.role} allowedRoles={['tenant_owner', 'accountant']}>
 *   <DangerousButton />
 * </RoleGate>
 * ```
 */
export function RoleGate({
  userRole,
  allowedRoles,
  permissions,
  category,
  fallback = null,
  children,
}: RoleGateProps) {
  // Super admins and tenant owners always pass
  if (userRole === 'super_admin' || userRole === 'tenant_owner') {
    return <>{children}</>;
  }

  // 1. Check role-based access
  if (!allowedRoles.includes(userRole as UserRole)) {
    return <>{fallback}</>;
  }

  // 2. Check granular module blocks
  if (category && permissions?.blockedModules?.includes(category)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
