'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';

interface CSVImportProps {
  entity: string;
  onSuccess: () => void;
}

export function CSVImport({ entity, onSuccess }: CSVImportProps) {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/v1/masters/${entity}/import`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success(`${entity} imported successfully`);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Import failed');
      }
    } catch (error) {
      toast.error('Error uploading file');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        disabled={importing}
      />
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        disabled={importing}
        className="h-14 px-8 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2"
      >
        {importing ? (
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {importing ? 'Importing...' : 'Import CSV'}
      </Button>
    </div>
  );
}
