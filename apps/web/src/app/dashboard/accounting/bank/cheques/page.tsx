'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Search, Filter, 
  CheckCircle2, XCircle, Clock, AlertCircle,
  FileText, Landmark, Hash, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn, formatUtcDate } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';

export default function ChequeManagementPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  
  const [newBook, setNewBook] = useState({
    bankAccountId: '',
    bookNo: '',
    startNo: '',
    endNo: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, bankRes] = await Promise.all([
        fetch('/api/v1/accounting/cheques/books'),
        fetch('/api/v1/accounting/coa')
      ]);
      
      const booksJson = await booksRes.json();
      const bankJson = await bankRes.json();
      
      if (booksJson.data) setBooks(booksJson.data);
      
      // Filter for bank accounts
      if (bankJson.data) {
        const banks: any[] = [];
        const flatten = (nodes: any[]) => {
          nodes.forEach(node => {
            if (node.name.toLowerCase().includes('bank')) banks.push(node);
            if (node.children) flatten(node.children);
          });
        };
        flatten(bankJson.data);
        setBankAccounts(banks);
      }
    } catch (err) {
      toast.error('Failed to load cheque data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/accounting/cheques/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        toast.success('Cheque book added successfully');
        setIsAddModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add cheque book');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);

  const fetchLeaves = async (bookId: string) => {
    try {
      const res = await fetch(`/api/v1/accounting/cheques/books/${bookId}/leaves`);
      const json = await res.json();
      if (json.data) setLeaves(json.data);
    } catch (err) {
      toast.error('Failed to load leaves');
    }
  };

  const openBookDetails = (book: any) => {
    setSelectedBook(book);
    fetchLeaves(book.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] px-2 rounded-lg">READY</Badge>;
      case 'issued': return <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] px-2 rounded-lg">ISSUED</Badge>;
      case 'cancelled': return <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[8px] px-2 rounded-lg">VOID</Badge>;
      default: return <Badge className="bg-slate-50 text-slate-400 border-none font-black text-[8px] px-2 rounded-lg">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700 pb-24">
      {/* ... previous header ... */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <CreditCard className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Banking Controls</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Cheque Inventory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage physical cheque books, track leaf status, and monitor clearances.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest gap-3 shadow-2xl shadow-slate-200">
          <Plus className="h-4 w-4" /> Add Cheque Book
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse" />)
        ) : books.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
             <Landmark className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-sm font-bold text-slate-400">No cheque books registered yet.</p>
          </div>
        ) : books.map((book) => (
          <div key={book.id} onClick={() => openBookDetails(book)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
             <div className="flex justify-between items-start mb-8">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <Landmark className="h-6 w-6" />
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2.5 py-1 rounded-lg">ACTIVE</Badge>
             </div>
             
             <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">{book.bankAccount?.name || 'Primary Bank'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Book No: {book.bookNo}</p>
             </div>

             <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-blue-100 transition-all">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Range</p>
                   <p className="text-sm font-black text-slate-900">{book.startNo} - {book.endNo}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-blue-100 transition-all">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Leaves</p>
                   <p className="text-sm font-black text-slate-900">{book.totalLeaves}</p>
                </div>
             </div>

             <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex-1 mr-6">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Health</p>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(book.usedCount / book.totalLeaves) * 100}%` }} />
                   </div>
                </div>
                <span className="text-[10px] font-black text-slate-900">{book.usedCount}/{book.totalLeaves}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Book Details Modal */}
      <Modal isOpen={!!selectedBook} onClose={() => setSelectedBook(null)} title={`${selectedBook?.bankAccount?.name} — ${selectedBook?.bookNo}`} size="xl">
         <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
               <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total</p>
                  <p className="text-sm font-black">{selectedBook?.totalLeaves}</p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Available</p>
                  <p className="text-sm font-black text-emerald-600">{selectedBook?.totalLeaves - selectedBook?.usedCount}</p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Issued</p>
                  <p className="text-sm font-black text-blue-600">{selectedBook?.usedCount}</p>
               </div>
               <div className="text-center border-l border-slate-200">
                  <p className="text-[8px] font-black text-rose-600 uppercase mb-1">Void</p>
                  <p className="text-sm font-black text-rose-600">0</p>
               </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden max-h-[400px] overflow-y-auto">
               <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                     <tr>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Leaf No</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Voucher</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {leaves.map(leaf => (
                        <tr key={leaf.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 text-xs font-black text-slate-900">CHQ {leaf.leafNo}</td>
                           <td className="px-6 py-4">{getStatusBadge(leaf.status)}</td>
                           <td className="px-6 py-4">
                              {leaf.journalEntry ? (
                                 <div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase">{leaf.journalEntry.voucherNo}</p>
                                    <p className="text-[9px] font-bold text-slate-400">{formatUtcDate(leaf.journalEntry.date, 'dd MMM yyyy')}</p>
                                 </div>
                              ) : '—'}
                           </td>
                           <td className="px-6 py-4 text-right">
                              {leaf.status === 'issued' && (
                                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-blue-600">
                                    <FileText className="h-4 w-4" />
                                 </Button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </Modal>


      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Cheque Book" size="lg">
         <form onSubmit={handleAddBook} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Bank Account</label>
               <select 
                  required
                  value={newBook.bankAccountId}
                  onChange={e => setNewBook({...newBook, bankAccountId: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none"
               >
                  <option value="">Select Account...</option>
                  {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Book Number / Series ID</label>
               <input 
                  required
                  placeholder="e.g. CB/2026/01"
                  value={newBook.bookNo}
                  onChange={e => setNewBook({...newBook, bookNo: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
               />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Cheque No.</label>
                  <input 
                     required
                     type="number"
                     placeholder="100001"
                     value={newBook.startNo}
                     onChange={e => setNewBook({...newBook, startNo: e.target.value})}
                     className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Cheque No.</label>
                  <input 
                     required
                     type="number"
                     placeholder="100050"
                     value={newBook.endNo}
                     onChange={e => setNewBook({...newBook, endNo: e.target.value})}
                     className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                  />
               </div>
            </div>

            <div className="pt-4 flex gap-3">
               <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
               <Button type="submit" className="flex-2 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs">Register Cheque Book</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}
