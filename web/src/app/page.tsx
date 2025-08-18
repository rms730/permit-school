import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { Pricing } from '@/components/Pricing';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { CtaBanner } from '@/components/CtaBanner';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Permit School — Pass your permit faster',
  description:
    'Interactive practice tests and bite‑sized lessons built from official driver handbooks. Progress tracking for learners, guardians, and schools.',
  openGraph: {
    title: 'Permit School — Pass your permit faster',
    description:
      'Interactive practice tests and bite‑sized lessons built from official driver handbooks.',
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
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CtaBanner />
      <Footer />
    </>
  );
}
