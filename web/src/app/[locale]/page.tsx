import { Container, Stack, Typography, Button } from '@mui/material';
import Link from 'next/link';

import { FAQ } from '../../components/FAQ';
import { FeatureGrid } from '../../components/FeatureGrid';
import { Header } from '../../components/Header';
import { Hero } from '../../components/Hero';
import { HowItWorks } from '../../components/HowItWorks';
import { Pricing } from '../../components/Pricing';

export default async function Page() {
  return (
    <>
      <Header />
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <Pricing />
      <FAQ />
    </>
  );
}


