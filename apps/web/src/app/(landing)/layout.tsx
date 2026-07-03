import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FreightFlow — Every Freight. Every Route. One Platform.',
  description:
    'Create LRs in 30 seconds. Auto-generate GST invoices. Track shipments, drivers & payments. Logistics & Supply Chain Intelligence for Indian transport businesses.',
  keywords: [
    'freight management', 'lorry receipt', 'LR software', 'transport SaaS',
    'GST compliance', 'fleet management India', 'logistics software',
    'pallet tracking', 'trip management', 'e-way bill',
  ],
  openGraph: {
    title: 'FreightFlow — Every Freight. Every Route. One Platform.',
    description: 'Create LRs in 30 seconds. Auto-generate GST invoices. Built for Indian transport businesses.',
    type: 'website',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
