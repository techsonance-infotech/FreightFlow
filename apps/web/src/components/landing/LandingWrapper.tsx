'use client';

import React from 'react';
import { useDemoModal } from '@/hooks/useDemoModal';
import BookDemoModal from './BookDemoModal';

export default function LandingWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useDemoModal();

  return (
    <>
      {children}
      <BookDemoModal isOpen={isOpen} onClose={close} />
    </>
  );
}
