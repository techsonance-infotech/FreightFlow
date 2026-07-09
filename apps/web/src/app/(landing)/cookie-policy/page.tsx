import type { Metadata } from 'next';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy — FreightFlow',
  description: 'Read the Cookie Policy for FreightFlow. Understand how we use cookies and similar tracking technologies to secure sessions and personalize operations.',
};

export default function CookiePolicyPage() {
  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col" style={{ background: '#0B1220' }}>
      <Nav />
      
      {/* Content Area */}
      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Heading */}
          <div className="border-b border-white/10 pb-8 mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Cookie Policy
            </h1>
            <p className="text-white/50 text-sm">
              Last updated: July 4, 2026
            </p>
          </div>

          {/* Legal Text */}
          <div className="prose prose-invert max-w-none text-white/70 space-y-6 leading-relaxed">
            <p>
              This Cookie Policy explains how <strong>FreightFlow</strong> (a registered product of <strong>Techsonance InfoTech LLP</strong>) uses cookies and similar technologies to recognize you when you visit our platform or marketing website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. What are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Why do we use Cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our online properties.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Types of Cookies We Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Strictly Necessary Cookies:</strong> These cookies are essential to provide you with services available through our platform and to use some of its features, such as access to secure dashboard areas, multi-tenant workspace routing, and session authentication.
              </li>
              <li>
                <strong>Performance and Functionality Cookies:</strong> These cookies are used to enhance the performance and functionality of our platform but are non-essential to their use (such as remembering your language choice or sidebar configurations).
              </li>
              <li>
                <strong>Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our platform is being used or how effective our marketing campaigns are, or to help us customize our platform for you.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Controlling Cookies</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and secure areas of our platform may be restricted.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Updates to this Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please email us at{' '}
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
