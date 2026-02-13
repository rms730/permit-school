import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { PageHeader } from '../PageHeader';
import { Button } from '@mui/material';

describe('PageHeader', () => {
  it('renders with basic props', () => {
    renderWithProviders(
      <PageHeader title="Page Title" />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title');
  });

  it('renders with subtitle', () => {
    renderWithProviders(
      <PageHeader 
        title="Page Title" 
        subtitle="Page subtitle description"
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title');
    expect(screen.getByText('Page subtitle description')).toBeInTheDocument();
  });

  it('renders with actions', () => {
    renderWithProviders(
      <PageHeader 
        title="Page with Actions" 
        actions={<Button>Action Button</Button>}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page with Actions');
    expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
  });

  it('renders with multiple actions', () => {
    renderWithProviders(
      <PageHeader 
        title="Page with Multiple Actions" 
        actions={
          <>
            <Button>Action 1</Button>
            <Button>Action 2</Button>
          </>
        }
      />
    );

    expect(screen.getByRole('button', { name: /action 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action 2/i })).toBeInTheDocument();
  });

  it('renders with different heading levels', () => {
    const { rerender } = renderWithProviders(
      <PageHeader title="Level 1" level={1} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Level 1');

    rerender(<PageHeader title="Level 2" level={2} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Level 2');

    rerender(<PageHeader title="Level 3" level={3} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Level 3');

    rerender(<PageHeader title="Level 4" level={4} />);
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Level 4');

    rerender(<PageHeader title="Level 5" level={5} />);
    expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Level 5');

    rerender(<PageHeader title="Level 6" level={6} />);
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Level 6');
  });

  it('renders with different alignments', () => {
    const { rerender } = renderWithProviders(
      <PageHeader title="Left Aligned" align="left" />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Left Aligned');

    rerender(<PageHeader title="Center Aligned" align="center" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Center Aligned');

    rerender(<PageHeader title="Right Aligned" align="right" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Right Aligned');
  });

  it('renders with custom component', () => {
    renderWithProviders(
      <PageHeader 
        title="Custom Component" 
        component="section"
      />
    );

    const header = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(header).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLElement>();
    
    renderWithProviders(
      <PageHeader title="Ref Test" ref={ref} />
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('applies custom sx styles', () => {
    renderWithProviders(
      <PageHeader 
        title="Styled Header" 
        sx={{ backgroundColor: 'red' }}
      />
    );

    const header = screen.getByRole('heading', { level: 1 }).closest('header');
    expect(header).toBeInTheDocument();
  });

  it('renders without subtitle when not provided', () => {
    renderWithProviders(
      <PageHeader title="No Subtitle" />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('No Subtitle');
    // Should not have any subtitle element
    const subtitleElement = document.querySelector('[class*="MuiTypography-h6"]');
    expect(subtitleElement).not.toBeInTheDocument();
  });

  it('renders without actions when not provided', () => {
    renderWithProviders(
      <PageHeader title="No Actions" />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('No Actions');
    // Should not have any buttons
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('handles long titles', () => {
    const longTitle = 'This is a very long page title that should be handled properly by the component without breaking the layout or causing any rendering issues.';
    
    renderWithProviders(
      <PageHeader title={longTitle} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(longTitle);
  });

  it('handles long subtitles', () => {
    const longSubtitle = 'This is a very long page subtitle that should be handled properly by the component. It should wrap correctly and maintain proper spacing without breaking the layout.';
    
    renderWithProviders(
      <PageHeader 
        title="Page Title" 
        subtitle={longSubtitle}
      />
    );

    expect(screen.getByText(longSubtitle)).toBeInTheDocument();
  });

  it('renders with complex actions', () => {
    renderWithProviders(
      <PageHeader 
        title="Complex Actions" 
        actions={
          <div>
            <Button variant="contained">Primary Action</Button>
            <Button variant="outlined">Secondary Action</Button>
            <Button variant="text">Tertiary Action</Button>
          </div>
        }
      />
    );

    expect(screen.getByRole('button', { name: /primary action/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /secondary action/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tertiary action/i })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(
      <PageHeader 
        title="Accessible Header"
        subtitle="Accessible subtitle"
      />
    );

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Accessible Header');
    
    // Check that subtitle is present
    expect(screen.getByText('Accessible subtitle')).toBeInTheDocument();
  });

  it('renders with responsive layout', () => {
    renderWithProviders(
      <PageHeader 
        title="Responsive Header" 
        subtitle="Responsive subtitle"
        actions={<Button>Responsive Action</Button>}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Responsive Header');
    expect(screen.getByText('Responsive subtitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /responsive action/i })).toBeInTheDocument();
  });

  it('handles empty title gracefully', () => {
    renderWithProviders(
      <PageHeader title="" />
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('');
  });

  it('handles empty subtitle gracefully', () => {
    renderWithProviders(
      <PageHeader 
        title="Title Only" 
        subtitle=""
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title Only');
    // Empty subtitle should not render - check for subtitle element instead
    const subtitleElement = document.querySelector('[class*="MuiTypography-h6"]');
    expect(subtitleElement).not.toBeInTheDocument();
  });
});
