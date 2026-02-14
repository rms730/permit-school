import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { Hero } from '../Hero';

// Mock the translations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'hero.title': 'Learn to Drive in California',
      'hero.subtitle': 'Comprehensive driver education for California permit test',
      'hero.primaryCta': 'Start practice',
      'hero.secondaryCta': 'See how it works',
      'trust.badge': 'Trusted by 10,000+ learners • 4.8★ average rating',
    };
    return translations[key] || key;
  },
}));

describe('Hero', () => {
  it('renders hero section with title and subtitle', () => {
    renderWithProviders(<Hero />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Learn to Drive in California');
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Comprehensive driver education for California permit test');
  });

  it('renders primary CTA button', () => {
    renderWithProviders(<Hero />);
    
    const primaryButton = screen.getByTestId('hero-start');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveTextContent('Start practice');
    expect(primaryButton).toHaveAttribute('data-cta', 'hero-start');
  });

  it('renders secondary CTA button', () => {
    renderWithProviders(<Hero />);
    
    const secondaryButton = screen.getByRole('link', { name: /see how it works/i });
    expect(secondaryButton).toBeInTheDocument();
  });

  it('renders feature list', () => {
    renderWithProviders(<Hero />);
    
    expect(screen.getByText('DMV-style questions')).toBeInTheDocument();
    expect(screen.getByText('Instant explanations')).toBeInTheDocument();
    expect(screen.getByText('Mobile-friendly')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<Hero />);
    
    const heroSection = document.querySelector('#section-hero');
    expect(heroSection).toBeInTheDocument();
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('handles button clicks', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Hero />);
    
    const primaryButton = screen.getByTestId('hero-start');
    const preventNavigation = vi.fn((event: Event) => event.preventDefault());
    primaryButton.addEventListener('click', preventNavigation);
    await user.click(primaryButton);
    
    expect(preventNavigation).toHaveBeenCalledTimes(1);
  });

  it('renders with proper styling classes', () => {
    renderWithProviders(<Hero />);
    
    const heroSection = document.querySelector('#section-hero');
    expect(heroSection).toHaveStyle({
      background: 'linear-gradient(140deg, #0e365e 0%, #0f6ecf 52%, #17866f 100%)',
      color: 'rgb(255, 255, 255)',
    });
  });

  it('renders responsive layout', () => {
    renderWithProviders(<Hero />);
    
    // Check that the component renders without errors
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
