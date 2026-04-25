'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface QuickAddModalProps {
  entity: string;
  title: string;
  FormComponent: React.ComponentType<any>;
  onSuccess: (data: any) => void;
  trigger?: React.ReactNode;
}

export function QuickAddModal({ entity, title, FormComponent, onSuccess, trigger }: QuickAddModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          + Add {entity}
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        size="lg"
      >
        <FormComponent
          onSuccess={(data: any) => {
            setIsOpen(false);
            onSuccess(data);
          }}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
