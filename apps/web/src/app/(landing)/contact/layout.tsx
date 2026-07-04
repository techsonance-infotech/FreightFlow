import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact FreightFlow — Support & Enterprise Inquiries',
  description:
    'Contact the FreightFlow support and sales team. Reach out via email at support@techsonance.co.in or call +91 91731 01711 for pricing and demos.',
  keywords: ['Contact FreightFlow', 'FreightFlow support', 'logistics sales India', 'techsonance address'],
  openGraph: {
    title: 'Contact FreightFlow — Support & Enterprise Inquiries',
    description: 'Get in touch with the FreightFlow team for general questions or enterprise plans.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
