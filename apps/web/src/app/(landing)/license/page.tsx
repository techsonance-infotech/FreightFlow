import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Software License Agreement — FreightFlow',
  description: 'Read the Software License Agreement for FreightFlow. Understand the terms, restrictions, and proprietary rights governing your use of our SaaS logistics platform.',
};

export default function LicensePage() {
  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col" style={{ background: '#0B1220' }}>
      <Nav />
      
      {/* Content Area */}
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Heading */}
          <div className="border-b border-white/10 pb-8 mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Software License Agreement
            </h1>
            <p className="text-white/50 text-sm">
              Last updated: July 4, 2026
            </p>
          </div>

          {/* Legal Text */}
          <div className="prose prose-invert max-w-none text-white/70 space-y-6 leading-relaxed">
            <p>
              This Software License Agreement ("Agreement") is a legal agreement between you (either an individual or a single entity) and <strong>Techsonance InfoTech LLP</strong> ("Techsonance") for the <strong>FreightFlow</strong> software, including dashboard interfaces, databases, APIs, driver mobile interfaces, and associated documentation (collectively, the "Software").
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. License Grant</h2>
            <p>
              Techsonance grants you a non-exclusive, non-transferable, revocable, limited license to access and use the Software as a Software-as-a-Service (SaaS) platform for your logistics and supply chain business operations. You may permit authorized users (employees, dispatchers, drivers, and sub-contractors) to access the Software in accordance with your active subscription plan limitations.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Proprietary Rights</h2>
            <p>
              All intellectual property rights, titles, and interests in and to the Software (including but not limited to any source code, database design schemas, logo designs, icons, typography, animations, and PDF layouts) are owned by Techsonance InfoTech LLP. The Software is protected by copyright laws and international treaty provisions.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. License Restrictions</h2>
            <p>Except as expressly permitted under this Agreement, you shall not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sell, rent, lease, sub-license, redistribute, or assign the Software or access to the Software to third parties.</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the Software.</li>
              <li>Bypass, modify, defeat, or circumvent security measures, including tenant isolation filters or APIs.</li>
              <li>Create derivative works based on the design system or structural layout of FreightFlow.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Term and Termination</h2>
            <p>
              This Agreement is effective until terminated. Your rights under this license will terminate automatically without notice from Techsonance if you fail to comply with any term(s) of this Agreement or fail to pay subscription invoices in a timely manner. Upon termination, you shall cease all use of the Software, and your database partitions will be archived/deleted in accordance with our data retention policies.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. No Warranty</h2>
            <p>
              The Software is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. Techsonance does not warrant that the Software will meet your requirements or that its operation will be uninterrupted or error-free.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions concerning this Software License Agreement, please contact us at{' '}
              <a href="mailto:support@techsonance.co.in" className="text-ff-teal-400 hover:underline">
                support@techsonance.co.in
              </a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
