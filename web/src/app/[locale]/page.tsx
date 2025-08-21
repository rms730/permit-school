import { Header } from '../../components/Header';
import { Container, Stack, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { Hero } from '../../components/Hero';
import { FeatureGrid } from '../../components/FeatureGrid';
import { HowItWorks } from '../../components/HowItWorks';
import { Pricing } from '../../components/Pricing';
import { FAQ } from '../../components/FAQ';

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


