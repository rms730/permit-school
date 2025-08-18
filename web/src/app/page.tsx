import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { StatsStrip } from '@/components/StatsStrip';
import { Pricing } from '@/components/Pricing';
import { FAQ } from '@/components/FAQ';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Permit School — Pass your DMV permit test fast, confident, first try',
  description:
    'Adaptive practice, bite‑size lessons, and real‑world questions built to help new drivers and parents get permit‑ready without the stress.',
  openGraph: {
    title: 'Permit School — Pass your DMV permit test fast, confident, first try',
    description:
      'Adaptive practice, bite‑size lessons, and real‑world questions built to help new drivers and parents get permit‑ready without the stress.',
    images: ['/og-image.png'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function Page() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:outline-none">
        Skip to content
      </a>
      <Header />
      <Hero />
      <FeatureGrid />
      <StatsStrip />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </>
  );
}
