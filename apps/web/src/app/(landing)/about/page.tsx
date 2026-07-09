import type { Metadata } from 'next';
import AboutClient from './about-client';

export const metadata: Metadata = {
  title: 'About Us | Logistics & Supply Chain Intelligence — FreightFlow',
  description: 'FreightFlow is a unified multi-tenant software built by Techsonance InfoTech LLP to streamline transport operations, accounting, and compliance for Indian logistics fleets.',
};

export default function AboutPage() {
  return <AboutClient />;
}
