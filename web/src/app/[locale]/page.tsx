import { FAQ } from '../../components/FAQ';
import { FeatureGrid } from '../../components/FeatureGrid';
import { Footer } from '../../components/Footer';
import { Header } from '../../components/Header';
import { Hero } from '../../components/Hero';
import { HowItWorks } from '../../components/HowItWorks';
import { Pricing } from '../../components/Pricing';

export default function Page() {
  return (
    <>
      <Header />
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
}
