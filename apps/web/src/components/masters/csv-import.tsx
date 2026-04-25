'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CSVImportProps {
  entity: string;
  onSuccess: () => void;
}

export function CSVImport({ entity, onSuccess }: CSVImportProps) {
  const [importing, setImporting] = useState(false);

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
        accept=".csv"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={importing}
      />
      <Button variant="outline" size="sm" loading={importing}>
        📥 Import CSV
      </Button>
    </div>
  );
}
