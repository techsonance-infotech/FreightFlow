'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, ArrowRight, Package, Truck, User, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  type: 'Order' | 'Vehicle' | 'Driver' | 'Customer';
  href: string;
}

export function SearchCommand() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearch = useCallback(async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(val)}`);
      const json = await res.json();
      setResults(json.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Order': return <Package className="h-4 w-4" />;
      case 'Vehicle': return <Truck className="h-4 w-4" />;
      case 'Driver': return <User className="h-4 w-4" />;
      case 'Customer': return <Building className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Decorative Search Bar Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-400 transition-all hover:border-blue-300 hover:bg-white shadow-sm flex-1 max-w-xs xl:max-w-md"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-left text-sm font-medium text-slate-400 truncate">Search LR, Vehicle, Driver...</span>
        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shrink-0">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Actual Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
              <Search className="h-5 w-5 text-blue-600" />
              <input 
                autoFocus
                className="flex-1 bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-300"
                placeholder="Type to search everything..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading ? (
                <div className="p-8 text-center text-slate-400">
                  <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Searching Records...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => navigate(res.href)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        {getTypeIcon(res.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-black text-slate-900">{res.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.type}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-200 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="p-12 text-center text-slate-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-bold">No results found for "{query}"</p>
                  <p className="text-xs mt-1">Try searching for a vehicle number or LR ID.</p>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Command className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm font-bold uppercase tracking-widest">Global Omnisearch</p>
                  <p className="text-xs mt-1">Search across Orders, Vehicles, Drivers, and Customers.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">↑↓</span> Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Enter</span> Select
                </span>
              </div>
              <span>FreightFlow Pro Search Engine</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
