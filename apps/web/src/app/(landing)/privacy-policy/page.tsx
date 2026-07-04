'use client';

import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col" style={{ background: '#0B1220' }}>
      <Nav />
      
      {/* Content Area */}
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Heading */}
          <div className="border-b border-white/10 pb-8 mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/50 text-sm">
              Last updated: July 4, 2026
            </p>
          </div>

          {/* Legal Text */}
          <div className="prose prose-invert max-w-none text-white/70 space-y-6 leading-relaxed">
            <p>
              At <strong>FreightFlow</strong>, a registered product of <strong>Techsonance InfoTech LLP</strong>, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by FreightFlow and how we use it.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>
              If you register for an account on FreightFlow, we may ask for your contact information, including items such as your name, company name, address, email address, telephone number, and payment information. We also collect transport-related data you upload to the platform (such as Lorry Receipts, vehicle information, and driver registries) for the sole purpose of providing services.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our platform and services.</li>
              <li>Improve, personalize, and expand our platform.</li>
              <li>Understand and analyze how you use our platform.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Communicate with you, either directly or through one of our partners, for customer service, updates, and other information relating to the website, and for marketing and promotional purposes.</li>
              <li>Process your transactions and manage accounting operations.</li>
              <li>Send you emails and transaction updates (e.g. e-way bills, e-invoices, and SMS alerts to drivers).</li>
              <li>Find and prevent fraud.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Log Files and Analytical Data</h2>
            <p>
              FreightFlow follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Data Security & Storage</h2>
            <p>
              We prioritize the safety of your logistics and financial details. We employ robust technical measures, including SSL encryption, PostgreSQL Row-Level Security (RLS) for tenant isolation, and strict database firewalls to protect your sensitive data from unauthorized access, disclosure, alteration, or destruction.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Third-Party Service Integrations</h2>
            <p>
              We integrate with governmental and statutory portals (such as GSTIN, e-Way Bill, and e-Invoice systems) to fetch and verify credentials, calculate TDS under Section 194C, and automate logistics operations. All data exchanged is securely encrypted in transit.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at{' '}
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
