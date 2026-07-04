import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — FreightFlow Product Updates & Releases',
  description:
    'Follow product release updates, new features, statutory integrations, and security patches implemented in the FreightFlow platform.',
  keywords: ['FreightFlow Changelog', 'product updates', 'release notes', 'e-invoice release', 'RLS policies'],
  openGraph: {
    title: 'Changelog — FreightFlow Product Updates & Releases',
    description: 'Track the latest features, improvements, and updates to the FreightFlow logistics platform.',
    type: 'website',
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
