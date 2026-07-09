import type { Metadata } from 'next';
import ContactClient from './contact-client';

export const metadata: Metadata = {
  title: 'Contact Us — FreightFlow',
  description: 'Have questions about features, pricing, or custom solutions? Contact the FreightFlow team for support or demo inquiries.',
};

export default function ContactPage() {
  return <ContactClient />;
}
