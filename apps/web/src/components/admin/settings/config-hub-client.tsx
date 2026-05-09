'use client';

import React, { useState } from 'react';
import { ConfigSidebar } from './config-sidebar';
import { BrandingSector } from './branding-sector';
import { BillingSector } from './billing-sector';
import { SecuritySector } from './security-sector';
import { InfraSector } from './infra-sector';

export function ConfigHubClient({ config }: { config: any }) {
  const [activeSector, setActiveSector] = useState('branding');

  const renderSector = () => {
    switch (activeSector) {
      case 'branding': return <BrandingSector config={config} />;
      case 'billing': return <BillingSector config={config} />;
      case 'security': return <SecuritySector config={config} />;
      case 'infra': return <InfraSector />;
      default: return <BrandingSector config={config} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-20">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <ConfigSidebar 
          activeSector={activeSector} 
          onSectorChange={setActiveSector} 
        />
      </div>

      {/* Main Configuration Sector */}
      <div className="lg:col-span-3">
        {renderSector()}
      </div>
    </div>
  );
}
