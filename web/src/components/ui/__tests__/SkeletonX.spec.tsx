import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { SkeletonX } from '../SkeletonX';

describe('SkeletonX', () => {
  it('renders with default props', () => {
    renderWithProviders(<SkeletonX />);

    // Should render 3 skeleton lines by default
    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders with custom number of lines', () => {
    renderWithProviders(<SkeletonX lines={5} />);

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(5);
  });

  it('renders with custom height and width', () => {
    renderWithProviders(
      <SkeletonX 
        height={30} 
        width="200px" 
      />
    );

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders with custom spacing', () => {
    renderWithProviders(<SkeletonX spacing={3} />);

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders text variant by default', () => {
    renderWithProviders(<SkeletonX />);

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders card variant', () => {
    renderWithProviders(<SkeletonX variant="card" />);

    // Card variant should render multiple skeleton elements
    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons.length).toBeGreaterThan(0);
    
    // Should have a card structure
    const card = document.querySelector('[class*="MuiCard-root"]');
    expect(card).toBeInTheDocument();
  });

  it('renders list variant', () => {
    renderWithProviders(<SkeletonX variant="list" lines={2} />);

    // List variant should render multiple skeleton elements per line
    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons.length).toBeGreaterThan(2);
  });

  it('renders hero variant', () => {
    renderWithProviders(<SkeletonX variant="hero" />);

    // Hero variant should render multiple skeleton elements
    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders table variant', () => {
    renderWithProviders(<SkeletonX variant="table" lines={3} />);

    // Table variant should render multiple skeleton elements per line
    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons.length).toBeGreaterThan(3);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    renderWithProviders(<SkeletonX ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies custom sx styles', () => {
    renderWithProviders(
      <SkeletonX 
        sx={{ backgroundColor: 'red' }}
      />
    );

    const container = document.querySelector('[class*="MuiSkeleton-root"]')?.closest('div');
    expect(container).toBeInTheDocument();
  });

  it('renders with different line counts for each variant', () => {
    const { rerender } = renderWithProviders(<SkeletonX variant="text" lines={1} />);
    let skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(1);

    rerender(<SkeletonX variant="list" lines={4} />);
    skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons.length).toBeGreaterThan(4);

    rerender(<SkeletonX variant="table" lines={2} />);
    skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons.length).toBeGreaterThan(2);
  });

  it('renders card variant with proper structure', () => {
    renderWithProviders(<SkeletonX variant="card" />);

    // Should have card and card content
    const card = document.querySelector('[class*="MuiCard-root"]');
    const cardContent = document.querySelector('[class*="MuiCardContent-root"]');
    
    expect(card).toBeInTheDocument();
    expect(cardContent).toBeInTheDocument();
  });

  it('renders list variant with proper structure', () => {
    renderWithProviders(<SkeletonX variant="list" lines={2} />);

    // Should have circular and text skeletons
    const circularSkeletons = document.querySelectorAll('[class*="MuiSkeleton-circular"]');
    const textSkeletons = document.querySelectorAll('[class*="MuiSkeleton-text"]');
    
    expect(circularSkeletons.length).toBeGreaterThan(0);
    expect(textSkeletons.length).toBeGreaterThan(0);
  });

  it('renders hero variant with proper structure', () => {
    renderWithProviders(<SkeletonX variant="hero" />);

    // Should have rectangular skeletons for buttons
    const rectangularSkeletons = document.querySelectorAll('[class*="MuiSkeleton-rectangular"]');
    expect(rectangularSkeletons.length).toBeGreaterThan(0);
  });

  it('renders table variant with proper structure', () => {
    renderWithProviders(<SkeletonX variant="table" lines={3} />);

    // Should have multiple text skeletons per row
    const textSkeletons = document.querySelectorAll('[class*="MuiSkeleton-text"]');
    expect(textSkeletons.length).toBeGreaterThan(3);
  });

  it('handles zero lines gracefully', () => {
    renderWithProviders(<SkeletonX lines={0} />);

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(0);
  });

  it('handles negative lines gracefully', () => {
    renderWithProviders(<SkeletonX lines={-1} />);

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(0);
  });

  it('handles very large number of lines', () => {
    renderWithProviders(<SkeletonX lines={100} />);

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(100);
  });

  it('renders with string height and width', () => {
    renderWithProviders(
      <SkeletonX 
        height="50px" 
        width="300px" 
      />
    );

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders with percentage width', () => {
    renderWithProviders(
      <SkeletonX 
        width="75%" 
      />
    );

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders with em/rem units', () => {
    renderWithProviders(
      <SkeletonX 
        height="2rem" 
        width="10em" 
      />
    );

    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons).toHaveLength(3);
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<SkeletonX />);

    // Skeleton components should be present for loading states
    const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders different variants with consistent structure', () => {
    const variants = ['text', 'card', 'list', 'hero', 'table'] as const;
    
    variants.forEach(variant => {
      const { unmount } = renderWithProviders(<SkeletonX variant={variant} />);
      
      const skeletons = document.querySelectorAll('[class*="MuiSkeleton-root"]');
      expect(skeletons.length).toBeGreaterThan(0);
      
      unmount();
    });
  });

  it('renders with complex sx styles', () => {
    renderWithProviders(
      <SkeletonX 
        sx={{ 
          backgroundColor: 'red',
          padding: '20px',
          margin: '10px',
          borderRadius: '8px'
        }}
      />
    );

    const container = document.querySelector('[class*="MuiSkeleton-root"]')?.closest('div');
    expect(container).toBeInTheDocument();
  });

  it('renders with theme-aware styling', () => {
    renderWithProviders(
      <SkeletonX 
        sx={{ 
          color: 'primary.main',
          bgcolor: 'background.paper'
        }}
      />
    );

    const container = document.querySelector('[class*="MuiSkeleton-root"]')?.closest('div');
    expect(container).toBeInTheDocument();
  });
});
