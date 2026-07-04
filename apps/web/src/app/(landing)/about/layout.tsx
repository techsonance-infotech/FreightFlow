import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About FreightFlow — Logistics Intelligence & Team',
  description:
    'FreightFlow is unified software designed to streamline operations, compliance, and accounting for Indian transport fleets. Learn about our mission and values.',
  keywords: ['About FreightFlow', 'logistics team', 'transportation software India', 'transporter empowerment'],
  openGraph: {
    title: 'About FreightFlow — Logistics Intelligence & Team',
    description: 'Learn about our mission to empower Indian transporters with robust operational tools.',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
