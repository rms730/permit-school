import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders with basic props', () => {
    renderWithProviders(
      <ErrorState message="Something went wrong" />
    );

    // Check for both elements with the same text
    const allElements = screen.getAllByText('Something went wrong');
    expect(allElements).toHaveLength(2); // title and message
    
    // Verify one is the heading and one is the paragraph
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Something went wrong');
    
    // Find the paragraph element specifically
    const messageElement = allElements.find(el => el.tagName === 'P');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement?.tagName).toBe('P');
  });

  it('renders with custom title', () => {
    renderWithProviders(
      <ErrorState 
        title="Custom Error Title" 
        message="Custom error message" 
      />
    );

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders with retry button', () => {
    const retryMock = vi.fn();
    
    renderWithProviders(
      <ErrorState 
        message="Error message" 
        retry={retryMock}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('calls retry function when retry button is clicked', async () => {
    const user = userEvent.setup();
    const retryMock = vi.fn();
    
    renderWithProviders(
      <ErrorState 
        message="Error message" 
        retry={retryMock}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
    
    expect(retryMock).toHaveBeenCalledTimes(1);
  });

  it('renders with details button when details are provided', () => {
    renderWithProviders(
      <ErrorState 
        message="Error message" 
        details="Error details here"
      />
    );

    expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
  });

  it.skip('toggles details visibility when details button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ErrorState 
        message="Error message" 
        details="Error details here"
      />
    );

    const detailsButton = screen.getByRole('button', { name: /show details/i });
    
    // Initially details should not be visible
    expect(screen.queryByText('Error details here')).not.toBeInTheDocument();
    
    // Click to show details
    await user.click(detailsButton);
    expect(screen.getByText('Error details here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide details/i })).toBeInTheDocument();
    
    // Click to hide details
    await user.click(screen.getByRole('button', { name: /hide details/i }));
    expect(screen.queryByText('Error details here')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = renderWithProviders(
      <ErrorState message="Small error" size="small" />
    );

    expect(screen.getByText('Small error')).toBeInTheDocument();

    rerender(
      <ErrorState message="Large error" size="large" />
    );

    expect(screen.getByText('Large error')).toBeInTheDocument();
  });

  it('renders with different alignments', () => {
    const { rerender } = renderWithProviders(
      <ErrorState message="Left aligned" align="left" />
    );

    expect(screen.getByText('Left aligned')).toBeInTheDocument();

    rerender(
      <ErrorState message="Right aligned" align="right" />
    );

    expect(screen.getByText('Right aligned')).toBeInTheDocument();
  });

  it('renders with both retry and details', () => {
    const retryMock = vi.fn();
    
    renderWithProviders(
      <ErrorState 
        message="Error with both options" 
        retry={retryMock}
        details="Error details"
      />
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLElement>();
    
    renderWithProviders(
      <ErrorState message="Ref test" ref={ref} />
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('renders with custom component', () => {
    renderWithProviders(
      <ErrorState 
        message="Custom component" 
        component="section"
      />
    );

    const errorState = screen.getByText('Custom component').closest('section');
    expect(errorState).toBeInTheDocument();
  });

  it('applies custom sx styles', () => {
    renderWithProviders(
      <ErrorState 
        message="Styled error" 
        sx={{ backgroundColor: 'red' }}
      />
    );

    const errorState = screen.getByText('Styled error').closest('div');
    expect(errorState).toBeInTheDocument();
  });

  it('renders error icon', () => {
    renderWithProviders(
      <ErrorState message="Error with icon" />
    );

    // Check for error icon (MUI icons are rendered as SVG)
    const errorIcon = document.querySelector('[data-testid="ErrorIcon"]');
    expect(errorIcon).toBeInTheDocument();
  });

  it('renders refresh icon in retry button', () => {
    const retryMock = vi.fn();
    
    renderWithProviders(
      <ErrorState 
        message="Error with retry" 
        retry={retryMock}
      />
    );

    // Check for refresh icon in retry button
    const refreshIcon = document.querySelector('[data-testid="RefreshIcon"]');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('renders expand icons in details button', () => {
    renderWithProviders(
      <ErrorState 
        message="Error with details" 
        details="Error details"
      />
    );

    // Initially should show expand more icon
    const expandMoreIcon = document.querySelector('[data-testid="ExpandMoreIcon"]');
    expect(expandMoreIcon).toBeInTheDocument();
  });

  it('shows expand less icon when details are expanded', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ErrorState 
        message="Error with details" 
        details="Error details"
      />
    );

    const detailsButton = screen.getByRole('button', { name: /show details/i });
    await user.click(detailsButton);

    // Should show expand less icon when expanded
    const expandLessIcon = document.querySelector('[data-testid="ExpandLessIcon"]');
    expect(expandLessIcon).toBeInTheDocument();
  });

  it('renders details in alert component', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(
      <ErrorState 
        message="Error with details" 
        details="Error details in alert"
      />
    );

    const detailsButton = screen.getByRole('button', { name: /show details/i });
    await user.click(detailsButton);

    // Details should be rendered in an alert
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Error details in alert')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <ErrorState 
        title="Accessible Error"
        message="Error message for accessibility"
      />
    );

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Accessible Error');
    
    // Check that error message is present
    expect(screen.getByText('Error message for accessibility')).toBeInTheDocument();
  });

  it('handles long error messages', () => {
    const longMessage = 'This is a very long error message that should be handled properly by the component without breaking the layout or causing any rendering issues. It should wrap correctly and maintain proper spacing.';
    
    renderWithProviders(
      <ErrorState message={longMessage} />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('handles long error details', async () => {
    const user = userEvent.setup();
    const longDetails = 'This is a very long error details message that should be handled properly by the component. It should wrap correctly in the alert component and maintain proper formatting. The details should be displayed in a monospace font and preserve whitespace.';
    
    renderWithProviders(
      <ErrorState 
        message="Error message" 
        details={longDetails}
      />
    );

    const detailsButton = screen.getByRole('button', { name: /show details/i });
    await user.click(detailsButton);

    expect(screen.getByText(longDetails)).toBeInTheDocument();
  });
});
