'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { VoucherForm } from './voucher-form';

interface AdvancedVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  accountOptions: any[];
  onSuccess: () => void;
}

export default function AdvancedVoucherModal({ 
  isOpen, 
  onClose, 
  initialData, 
  accountOptions,
  onSuccess 
}: AdvancedVoucherModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Journal Voucher"
      size="xl"
    >
      <div className="py-4">
        <VoucherForm 
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
