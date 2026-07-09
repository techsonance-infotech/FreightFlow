import type { Metadata } from 'next';
import LandingWrapper from '@/components/landing/LandingWrapper';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freightflow.techsonance.co.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: './',
  },
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
    url: siteUrl,
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://freightflow.techsonance.co.in').replace(/\/$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${baseUrl}/#software`,
        'name': 'FreightFlow',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'INR',
          'lowPrice': '4999',
          'highPrice': '9999',
          'offerCount': '2',
          'price': '4999',
          'priceValidUntil': '2027-12-31',
        },
        'description': 'Logistics & Supply Chain Intelligence software for Indian transport businesses. Create LRs in 30 seconds, auto-generate GST invoices, and track shipments.',
        'publisher': {
          '@type': 'Organization',
          'name': 'Techsonance InfoTech LLP',
          'url': 'https://techsonance.co.in',
          'logo': {
            '@type': 'ImageObject',
            'url': `${baseUrl}/favicon_io/android-chrome-512x512.png`,
          },
          'sameAs': [
            'https://linkedin.com/company/techsonance-infotech/',
            'https://x.com/techsonance_in',
            'https://www.instagram.com/techsonance_infotech/?igsh=MTZqNm04enMxaGZmbg%3D%3D#',
          ],
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is FreightFlow?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'FreightFlow is a premium logistics management software specifically built for the speed of Indian highway transport, enabling digital Lorry Receipt (LR) generation, GST billing, and fleet tracking.',
            },
          },
          {
            '@type': 'Question',
            'name': 'How much does FreightFlow cost?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'During our launch phase, the Starter plan is available at ₹4,999/year and the Growth plan is at ₹9,999/year. Localized rates may vary, so contact us for exact pricing.',
            },
          },
        ],
      },
    ],
  };

  return (
    <LandingWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </LandingWrapper>
  );
}

