'use client';

import { useState, useEffect } from 'react';

// Custom event name
const EVENT_NAME = 'ff-open-demo-modal';

// Function to trigger the modal open from anywhere
export function triggerDemoModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

// Hook to manage the modal state in a layout/parent wrapper
export function useDemoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    
    window.addEventListener(EVENT_NAME, handleOpen);
    return () => {
      window.removeEventListener(EVENT_NAME, handleOpen);
    };
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
