'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, ChevronRight, ChevronDown, 
  Wallet, Landmark, BarChart3, TrendingUp, PieChart,
  FileText, Edit2, AlertCircle, RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { COAForm } from '@/components/accounting/coa-form';
import { type ChartOfAccount } from '@freightflow/shared';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LoadingState, Pagination } from '@/components/reports/report-components';

export default function ChartOfAccountsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [parentOptions, setParentOptions] = useState<{id: string, name: string, code: string}[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchCOA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/accounting/coa');
      const text = await response.text();
      
      if (!text) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      if (response.ok) {
        setData(result.data || []);
        const flatten = (nodes: any[], res: any[] = []) => {
          if (!nodes || !Array.isArray(nodes)) return res;
          nodes.forEach(node => {
            res.push({ id: node.id, name: node.name, code: node.code });
            if (node.children) flatten(node.children, res);
          });
          return res;
        };
        setParentOptions(flatten(result.data || []));
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (error: any) {
      console.error('COA Fetch Error:', error);
      toast.error(error.message || 'Failed to fetch Chart of Accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCOA();
  }, []);

  const toggleNode = (id: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'asset': return <Wallet className="h-4 w-4" />;
      case 'liability': return <Landmark className="h-4 w-4" />;
      case 'equity': return <PieChart className="h-4 w-4" />;
      case 'revenue': return <TrendingUp className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />; // expense
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'asset': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'liability': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'equity': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'revenue': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-accent-600 bg-accent-50 border-accent-100';
    }
  };

  const filterNodes = (nodes: any[]): any[] => {
    return nodes
      .filter(node => {
        const matchesSearch = node.name.toLowerCase().includes(search.toLowerCase()) || 
                             node.code.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || node.type.toLowerCase() === typeFilter;
        
        if (search) {
          const childrenMatch = node.children && filterNodes(node.children).length > 0;
          return matchesSearch || childrenMatch;
        }
        
        return matchesType;
      })
      .map(node => ({
        ...node,
        children: node.children ? filterNodes(node.children) : []
      }));
  };

  const renderTree = (nodes: any[], level = 0) => {
    const sorted = [...nodes].sort((a, b) => a.code.localeCompare(b.code));
    
    return sorted.map(node => {
      const isExpanded = expandedNodes.has(node.id) || search.length > 0;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.id} className="w-full">
          <div 
            className={cn(
              "group flex items-center justify-between py-4 pr-8 border-b border-neutral-100 hover:bg-neutral-50/50 transition-all",
              level === 0 ? "bg-white" : "bg-transparent"
            )}
            style={{ paddingLeft: `${level * 2.5 + 2}rem` }}
          >
            <div className="flex items-center gap-5 relative">
              {level > 0 && (
                <div 
                  className="absolute left-[-1.5rem] top-1/2 -translate-y-1/2 w-5 h-[1px] bg-neutral-200"
                />
              )}
              
              <div className="flex items-center gap-4">
                {hasChildren ? (
                  <button 
                    onClick={() => toggleNode(node.id)}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    )}
                  </button>
                ) : (
                  <div className="w-8" />
                )}
                
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 shadow-sm transition-transform group-hover:scale-105", getTypeColor(node.type))}>
                  {getTypeIcon(node.type)}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-100">{node.code}</span>
                    <p className="text-sm font-black text-neutral-900 leading-tight group-hover:text-accent-600 transition-colors">{node.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 rounded border",
                      node.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-neutral-100 text-neutral-400 border-neutral-200"
                    )}>
                      {node.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {node.isSystem && (
                      <span className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 rounded border bg-amber-50 text-amber-600 border-amber-100">
                        System
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 px-3 rounded-lg text-neutral-400 hover:text-accent-600 hover:bg-accent-50 font-bold text-[10px] uppercase tracking-widest gap-2"
                onClick={() => { setEditingAccount(node); setIsModalOpen(true); }}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="w-full relative">
              <div 
                className="absolute left-[2.85rem] top-0 bottom-0 w-[1px] bg-neutral-100"
                style={{ left: `${level * 2.5 + 2.85}rem` }}
              />
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredData = filterNodes(data);
  const totalItems = filteredData.length;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-accent-600 flex items-center justify-center shadow-lg shadow-accent-600/20">
              <PieChart className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.2em]">Financial Architecture</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Chart of Accounts</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Hierarchical ledger structure for multi-tenant reporting</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchCOA}
            variant="outline" 
            className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-xs uppercase tracking-widest transition-all bg-white"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2 text-accent-600", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
            className="h-11 px-6 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-accent-600/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[300px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Search Ledger</p>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-accent-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search by account name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/5 focus:border-accent-600 transition-all"
            />
          </div>
        </div>

        <div className="w-[240px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Account Type</p>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-accent-600 transition-colors" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/5 focus:border-accent-600 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expenses</option>
            </select>
          </div>
        </div>
      </div>

      {/* COA Tree Container */}
      <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between py-4 px-8 bg-neutral-50/50 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Account Hierarchy</span>
            <div className="h-4 w-[1px] bg-neutral-200" />
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">{totalItems} Total Ledgers</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-neutral-400 uppercase">Balanced Architecture</span>
            </div>
          </div>
        </div>

        <div className="min-h-[400px] max-h-[700px] overflow-y-auto custom-scrollbar bg-white">
          {loading ? (
            <div className="p-8"><LoadingState rows={12} /></div>
          ) : paginatedData.length === 0 ? (
            <div className="p-20 text-center">
              <div className="h-24 w-24 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-neutral-100 shadow-inner">
                <AlertCircle className="h-12 w-12 text-neutral-300" />
              </div>
              <h4 className="text-lg font-black text-neutral-900 uppercase tracking-widest">No Records Match</h4>
              <p className="text-sm font-bold text-neutral-400 mt-2 max-w-[320px] mx-auto">Expand your search criteria or create a new ledger entry above.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100/50">
              {renderTree(paginatedData)}
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-neutral-50/50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8 order-2 sm:order-1">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-accent-500 animate-pulse shadow-sm shadow-accent-500/50" />
              <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Live Engine</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
              <span>Tenant Isolated</span>
              <div className="h-1 w-1 rounded-full bg-neutral-300" />
              <span>Audit Ready</span>
            </div>
          </div>
          
          <div className="w-full sm:w-auto order-1 sm:order-2 flex items-center gap-4">
            <select 
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="h-9 px-3 bg-white border border-neutral-200 rounded-lg text-[10px] font-black text-neutral-500 uppercase tracking-widest outline-none focus:ring-2 focus:ring-accent-600/10 transition-all cursor-pointer"
            >
              <option value={10}>10 / Page</option>
              <option value={20}>20 / Page</option>
              <option value={50}>50 / Page</option>
              <option value={100}>100 / Page</option>
            </select>
            <Pagination 
              currentPage={page}
              totalPages={Math.ceil(totalItems / limit)}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Refine Account' : 'Initialize New Ledger'}
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
