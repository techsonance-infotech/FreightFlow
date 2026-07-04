'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import PainSection from '@/components/landing/PainSection';
import WhyFreightFlow from '@/components/landing/WhyFreightFlow';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import MultiCompany from '@/components/landing/MultiCompany';
import SecuritySection from '@/components/landing/SecuritySection';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  useSmoothScroll();

  return (
    <main className="overflow-x-hidden" style={{ background: '#0B1220' }}>
      <Nav />
      <Hero />
      <PainSection />
      <WhyFreightFlow />
      <HowItWorks />
      <Features />
      <MultiCompany />
      <SecuritySection />
      <SocialProof />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
