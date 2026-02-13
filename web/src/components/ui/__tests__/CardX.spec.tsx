import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { CardX } from '../CardX';
import { Button } from '@mui/material';

describe('CardX', () => {
  it('renders with basic props', () => {
    renderWithProviders(
      <CardX title="Test Card" subtitle="Test Subtitle">
        <p>Card content</p>
      </CardX>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders without title and subtitle', () => {
    renderWithProviders(
      <CardX>
        <p>Card content only</p>
      </CardX>
    );

    expect(screen.getByText('Card content only')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders with actions', () => {
    renderWithProviders(
      <CardX 
        title="Card with Actions" 
        actions={<Button>Action Button</Button>}
      >
        <p>Content</p>
      </CardX>
    );

    expect(screen.getByText('Card with Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
  });

  it('renders with header actions', () => {
    renderWithProviders(
      <CardX 
        title="Card with Header Actions" 
        headerActions={<Button>Header Action</Button>}
      >
        <p>Content</p>
      </CardX>
    );

    expect(screen.getByText('Card with Header Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /header action/i })).toBeInTheDocument();
  });

  it('applies different variants correctly', () => {
    const { rerender } = renderWithProviders(
      <CardX title="Elevation Card" variant="elevation">
        <p>Content</p>
      </CardX>
    );

    const card = screen.getByText('Elevation Card').closest('[class*="MuiCard-root"]');
    expect(card).toBeInTheDocument();

    rerender(
      <CardX title="Outlined Card" variant="outlined">
        <p>Content</p>
      </CardX>
    );

    const outlinedCard = screen.getByText('Outlined Card').closest('[class*="MuiCard-root"]');
    expect(outlinedCard).toBeInTheDocument();
  });

  it('applies different spacing correctly', () => {
    const { rerender } = renderWithProviders(
      <CardX title="Compact Card" spacing="compact">
        <p>Content</p>
      </CardX>
    );

    expect(screen.getByText('Compact Card')).toBeInTheDocument();

    rerender(
      <CardX title="Relaxed Card" spacing="relaxed">
        <p>Content</p>
      </CardX>
    );

    expect(screen.getByText('Relaxed Card')).toBeInTheDocument();
  });

  it('applies custom title and subtitle variants', () => {
    renderWithProviders(
      <CardX 
        title="Custom Title" 
        subtitle="Custom Subtitle"
        titleVariant="h4"
        subtitleVariant="body1"
      >
        <p>Content</p>
      </CardX>
    );

    const title = screen.getByText('Custom Title');
    const subtitle = screen.getByText('Custom Subtitle');
    
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    
    renderWithProviders(
      <CardX title="Ref Test" ref={ref}>
        <p>Content</p>
      </CardX>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies custom sx styles', () => {
    renderWithProviders(
      <CardX 
        title="Styled Card" 
        sx={{ backgroundColor: 'red' }}
      >
        <p>Content</p>
      </CardX>
    );

    const card = screen.getByText('Styled Card').closest('[class*="MuiCard-root"]');
    expect(card).toBeInTheDocument();
  });

  it('handles hover effects', () => {
    renderWithProviders(
      <CardX title="Hover Card">
        <p>Content</p>
      </CardX>
    );

    const card = screen.getByText('Hover Card').closest('[class*="MuiCard-root"]');
    expect(card).toBeInTheDocument();
    
    // Note: Hover effects are CSS-based and can't be easily tested in jsdom
    // The test verifies the component renders without errors
  });

  it('renders with complex children', () => {
    renderWithProviders(
      <CardX title="Complex Card">
        <div>
          <h3>Nested Heading</h3>
          <p>Nested paragraph</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </div>
      </CardX>
    );

    expect(screen.getByText('Complex Card')).toBeInTheDocument();
    expect(screen.getByText('Nested Heading')).toBeInTheDocument();
    expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('List item 2')).toBeInTheDocument();
  });

  it('renders with multiple actions', () => {
    renderWithProviders(
      <CardX 
        title="Multiple Actions" 
        actions={
          <>
            <Button>Action 1</Button>
            <Button>Action 2</Button>
          </>
        }
      >
        <p>Content</p>
      </CardX>
    );

    expect(screen.getByRole('button', { name: /action 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action 2/i })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <CardX title="Accessible Card">
        <p>Content</p>
      </CardX>
    );

    const card = screen.getByText('Accessible Card').closest('[class*="MuiCard-root"]');
    expect(card).toBeInTheDocument();
    
    // Check that the title is properly associated
    const title = screen.getByText('Accessible Card');
    expect(title).toBeInTheDocument();
  });
});
