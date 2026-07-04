'use client';

import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col" style={{ background: '#0B1220' }}>
      <Nav />
      
      {/* Content Area */}
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Heading */}
          <div className="border-b border-white/10 pb-8 mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-white/50 text-sm">
              Last updated: July 4, 2026
            </p>
          </div>

          {/* Legal Text */}
          <div className="prose prose-invert max-w-none text-white/70 space-y-6 leading-relaxed">
            <p>
              Welcome to <strong>FreightFlow</strong>. These Terms of Service ("Terms") govern your use of the FreightFlow software platform and services owned and operated by <strong>Techsonance InfoTech LLP</strong> ("Techsonance", "we", "our", or "us").
            </p>

            <p>
              By accessing or using our platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not access or use the platform.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Use of the Services</h2>
            <p>
              FreightFlow is a multi-tenant logistics management and intelligence platform. You agree to use the platform only for lawful business purposes related to transport and supply chain management. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Account Registration and Billing</h2>
            <p>
              To use certain features of the platform, you must register for an account and provide accurate corporate information (registered address, GST details if applicable). Services are billed based on the plan selected (Starter, Growth, or Enterprise) in accordance with the billing cycles. Fees are non-refundable unless specified otherwise.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Data Ownership and Compliance</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Your Data:</strong> You retain ownership of all Lorry Receipts (LR), driver details, fuel expenses, and accounting records uploaded to the platform. You grant us the license to host, parse, and process this data solely to provide the services.</li>
              <li><strong>Government Portal Compliance:</strong> You authorize FreightFlow to interact with government gateways on your behalf (e.g. NIC e-Way Bill and e-Invoice systems) using credentials you provide. You are responsible for ensuring validity and compliance of invoices issued under your account.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Acceptable Use and Restrictions</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify, translate, reverse engineer, or decompile any part of the platform code.</li>
              <li>Attempt to gain unauthorized access to other tenants' databases or violate row-level security (RLS) policies.</li>
              <li>Use the services to transmit malware, spam, or execute denial of service attacks.</li>
              <li>Violate the intellectual property rights of Techsonance InfoTech LLP.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Techsonance InfoTech LLP shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Modification of Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Governing Law and Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Disputes shall be subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
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
