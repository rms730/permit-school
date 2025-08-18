import { Header } from '../../components/Header';
import { Container, Stack, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { Hero } from '../../components/Hero';
import { FeatureGrid } from '../../components/FeatureGrid';

export default async function Page() {
  return (
    <>
      <Header />
      <Hero />
      <FeatureGrid />
    </>
  );
}


