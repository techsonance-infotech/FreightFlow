import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The FreightFlow Blog — Logistics, GST & Fleet Insights',
  description:
    'Read articles and guides on transport tax laws, GST compliance, driver registries, PostgreSQL RLS security, and Indian logistics efficiency.',
  keywords: ['FreightFlow Blog', 'logistics guides', 'GST transport', 'e-way bill automation', '194C TDS'],
  openGraph: {
    title: 'The FreightFlow Blog — Logistics, GST & Fleet Insights',
    description: 'Expert guides on Indian transport, statutory compliance, tax laws, and digital logistics.',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
