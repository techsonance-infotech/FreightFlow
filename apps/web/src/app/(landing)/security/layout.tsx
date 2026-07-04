import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security & Compliance — FreightFlow Data Protection',
  description:
    'FreightFlow secures shipper directories using PostgreSQL Row-Level Security, TLS 1.3 transit encryption, AES-256 at-rest protection, and automated cloud backups.',
  keywords: ['FreightFlow Security', 'data protection', 'row level security RLS', 'encrypted logistics database'],
  openGraph: {
    title: 'Security & Compliance — FreightFlow Data Protection',
    description: 'Learn how we secure your logistics, dispatch, and accounting records in the cloud.',
    type: 'website',
  },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
