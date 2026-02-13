import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    renderWithProviders(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('renders different variants correctly', () => {
    const { rerender } = renderWithProviders(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-contained');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-outlined');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-text');

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-text');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = renderWithProviders(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeSmall');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeMedium');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeLarge');
  });

  it('shows loading state', () => {
    renderWithProviders(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading');
    // Check for loading spinner
    expect(button.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles anchor links', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    renderWithProviders(
      <Button href="#section" onClick={handleClick}>
        Go to section
      </Button>
    );
    const link = screen.getByRole('link');
    
    await user.click(link);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icons', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    
    renderWithProviders(
      <Button icon={<TestIcon />} iconPosition="start">
        With Icon
      </Button>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('With Icon');
  });

  it('renders with end icon', () => {
    const TestIcon = () => <span data-testid="test-icon">→</span>;
    
    renderWithProviders(
      <Button icon={<TestIcon />} iconPosition="end">
        With End Icon
      </Button>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('With End Icon');
  });

  it('applies fullWidth correctly', () => {
    renderWithProviders(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-fullWidth');
  });

  it('applies custom data attributes', () => {
    renderWithProviders(
      <Button data-testid="custom-button" data-cta="signup">
        Custom Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('data-cta', 'signup');
  });

  it('is disabled when loading', () => {
    renderWithProviders(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders as link when href is provided', () => {
    renderWithProviders(<Button href="/external-link">External Link</Button>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/external-link');
  });
});
