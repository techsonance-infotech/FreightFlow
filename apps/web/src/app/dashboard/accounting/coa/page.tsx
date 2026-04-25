'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { COAForm } from '@/components/accounting/coa-form';
import { type ChartOfAccount } from '@freightflow/shared';
import { toast } from 'sonner';

export default function ChartOfAccountsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [parentOptions, setParentOptions] = useState<{id: string, name: string, code: string}[]>([]);

  const fetchCOA = async () => {
    setLoading(true);
    try {
      // Assuming tenantId and companyId are handled via middleware/headers in a real app,
      // but for testing we might need to pass them or rely on the API to handle default session.
      // Since this is a demo, the API handles fallback if headers exist, otherwise we should pass query params.
      // We'll rely on the global interceptor or default tenant for now.
      const response = await fetch('/api/v1/accounting/coa');
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        // Flatten for parent dropdown
        const flatten = (nodes: any[], result: any[] = []) => {
          nodes.forEach(node => {
            result.push({ id: node.id, name: node.name, code: node.code });
            if (node.children) flatten(node.children, result);
          });
          return result;
        };
        setParentOptions(flatten(result.data));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch Chart of Accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCOA();
  }, []);

  const renderTree = (nodes: any[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="w-full">
        <div 
          className={`flex items-center justify-between py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${level === 0 ? 'bg-slate-50/50' : ''}`}
          style={{ paddingLeft: `${level * 2}rem` }}
        >
          <div className="flex items-center gap-3">
            <span className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-black ${
              node.type === 'asset' ? 'bg-emerald-100 text-emerald-700' :
              node.type === 'liability' ? 'bg-rose-100 text-rose-700' :
              node.type === 'equity' ? 'bg-indigo-100 text-indigo-700' :
              node.type === 'revenue' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-200 text-slate-700' // expense
            }`}>
              {node.type.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-bold text-slate-800">{node.code} - {node.name}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.type}</p>
            </div>
          </div>
          <div className="pr-4">
            <Button variant="ghost" size="sm" onClick={() => { setEditingAccount(node); setIsModalOpen(true); }}>
              Edit
            </Button>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="w-full">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Chart of Accounts</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your financial ledger hierarchy</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { setEditingAccount(null); setIsModalOpen(true); }} icon="➕">
            Add Account
          </Button>
        </div>
      </div>

      {/* COA Tree */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Loading accounts...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold">No accounts found. Create your first account.</div>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between py-3 px-4 bg-slate-100 border-b border-slate-200">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Details</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">Actions</span>
            </div>
            <div className="px-4">
              {renderTree(data)}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Edit Account' : 'Create New Account'}
        size="lg"
      >
        <COAForm
          initialData={editingAccount || undefined}
          parentOptions={parentOptions.filter(p => p.id !== editingAccount?.id)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCOA();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
