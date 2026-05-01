'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { SimplifiedTransactionForm } from './simplified-transaction-form';

interface SimpleVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'payment' | 'receipt';
  initialData?: any;
  accountOptions: any[];
  onSuccess: () => void;
}

export default function SimpleVoucherModal({ 
  isOpen, 
  onClose, 
  type, 
  initialData, 
  accountOptions,
  onSuccess 
}: SimpleVoucherModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'payment' ? 'Money Out (Payment)' : 'Money In (Receipt)'}
      size="xl"
    >
      <div className="py-4">
        <SimplifiedTransactionForm 
          type={type} 
          initialData={initialData} 
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
          accountOptions={accountOptions}
        />
      </div>
    </Modal>
  );
}
