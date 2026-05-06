'use client';

import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, 
  Mail, Phone, MoreHorizontal,
  CheckCircle2, XCircle, ShieldCheck,
  ShieldAlert, UserCog, Building2,
  X, Save, Loader2, Key, LayoutGrid,
  Lock, Unlock, MailCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { inviteUser, updateUserRole, toggleUserStatus, updateUserPermissions, resendWelcomeEmail } from '@/app/actions/settings/team';
import { NAV_CATEGORIES } from '@/config/rbac';

interface User {
  id: string;
  name: string;
  email: string | null;
  role: string;
  isActive: boolean;
  permissions: any;
  branch: { name: string } | null;
  createdAt: any;
}

interface TeamManagerProps {
  users: User[];
  branches: { id: string, name: string }[];
  currentUserId: string;
}

const ROLES = [
  { id: 'tenant_owner', name: 'Tenant Owner', icon: <ShieldCheck className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
  { id: 'fleet_owner', name: 'Fleet Owner', icon: <ShieldCheck className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50' },
  { id: 'admin', name: 'Administrator', icon: <Shield className="h-4 w-4" />, color: 'text-indigo-600 bg-indigo-50' },
  { id: 'ops_manager', name: 'Operations Manager', icon: <UserCog className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50' },
  { id: 'hr_manager', name: 'HR Manager', icon: <Users className="h-4 w-4" />, color: 'text-purple-600 bg-purple-50' },
  { id: 'accountant', name: 'Accountant', icon: <Building2 className="h-4 w-4" />, color: 'text-rose-600 bg-rose-50' },
  { id: 'dispatch_officer', name: 'Dispatch Officer', icon: <Users className="h-4 w-4" />, color: 'text-cyan-600 bg-cyan-50' },
  { id: 'maintenance_supervisor', name: 'Maintenance Lead', icon: <UserCog className="h-4 w-4" />, color: 'text-orange-600 bg-orange-50' },
  { id: 'auditor', name: 'Auditor', icon: <Shield className="h-4 w-4" />, color: 'text-slate-600 bg-slate-50' },
  { id: 'driver', name: 'Driver / Staff', icon: <Users className="h-4 w-4" />, color: 'text-slate-600 bg-slate-50' },
  { id: 'staff', name: 'General Staff', icon: <Users className="h-4 w-4" />, color: 'text-slate-400 bg-slate-50' },
];

export function TeamManager({ users, branches, currentUserId }: TeamManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'staff',
    branchId: 'all',
    password: '',
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await inviteUser(inviteData);
      toast.success('Team member invited successfully');
      setIsModalOpen(false);
      setInviteData({ name: '', email: '', role: 'staff', branchId: 'all', password: '' });
    } catch (err: any) {
      toast.error(err.message || 'Invitation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('Role updated successfully');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleModule = async (user: User, categoryId: string) => {
    try {
      const currentBlocked = user.permissions?.blockedModules || [];
      let newBlocked = [];
      
      if (currentBlocked.includes(categoryId)) {
        newBlocked = currentBlocked.filter((id: string) => id !== categoryId);
      } else {
        newBlocked = [...currentBlocked, categoryId];
      }

      await updateUserPermissions(user.id, { 
        ...user.permissions, 
        blockedModules: newBlocked 
      });
      
      toast.success('Permissions synchronized');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleResendCredentials = async (userId: string) => {
    try {
      setLoading(true);
      await resendWelcomeEmail(userId);
      toast.success('Account credentials dispatched via email');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 p-8 lg:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Team Intelligence</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage role-based access control and organizational hierarchy.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 gap-3 active:scale-95 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Onboard Member
        </Button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user) => {
          const roleInfo = ROLES.find(r => r.id === user.role) || ROLES[5];
          const isMe = user.id === currentUserId;

          return (
            <div key={user.id} className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
              <div className="absolute top-8 right-8">
                {user.isActive ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-slate-300" />
                )}
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{user.name}</h3>
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-lg mt-1.5", roleInfo.color)}>
                    {roleInfo.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{roleInfo.name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-bold truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-bold">{user.branch?.name || 'All Branches'}</span>
                </div>
              </div>

              {/* Module Control Section */}
              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-3 w-3 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Access</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {NAV_CATEGORIES.map(category => {
                    const isBlocked = user.permissions?.blockedModules?.includes(category.id);
                    const canControl = !isMe && (user.role !== 'tenant_owner');

                    return (
                      <button
                        key={category.id}
                        disabled={!canControl}
                        onClick={() => handleToggleModule(user, category.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5",
                          isBlocked 
                            ? "bg-rose-50 text-rose-500 border border-rose-100" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100",
                          !canControl && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isBlocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {category.label.split(' & ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex gap-2">
                  {!isMe && (
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                    >
                      {ROLES.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isMe && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleResendCredentials(user.id)}
                        title="Resend Credentials"
                        className="h-10 w-10 p-0 rounded-xl text-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <MailCheck className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={cn(
                          "h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                          user.isActive ? "text-rose-500 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                        )}
                      >
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </div>
                  )}
                  {isMe && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">Current User</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Onboard Team Member</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <Input 
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                    placeholder="Enter staff name"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official Email</label>
                  <Input 
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="staff@company.com"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Role</label>
                  <select 
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                  >
                    {ROLES.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Branch</label>
                  <select 
                    value={inviteData.branchId}
                    onChange={(e) => setInviteData({ ...inviteData, branchId: e.target.value })}
                    className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-sm text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                  >
                    <option value="all">All Branches (Global)</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Temporary Password</label>
                <div className="relative">
                  <Input 
                    type="password"
                    value={inviteData.password}
                    onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                    placeholder="Set initial password"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                    <Key className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-[11px] leading-relaxed text-amber-700 font-medium">
                  Newly onboarded members will have access restricted to their assigned branch. Owners and Administrators have global visibility across all locations.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-black text-[10px] uppercase tracking-widest text-slate-400">Discard</Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-200 gap-3"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Authorize & Onboard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
