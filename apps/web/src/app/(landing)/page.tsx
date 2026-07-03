'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import PainSection from '@/components/landing/PainSection';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import MultiCompany from '@/components/landing/MultiCompany';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  useSmoothScroll();

  return (
    <main className="overflow-x-hidden" style={{ background: '#0A1628' }}>
      <Nav />
      <Hero />
      <PainSection />
      <HowItWorks />
      <Features />
      <MultiCompany />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
