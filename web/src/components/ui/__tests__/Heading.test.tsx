import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { Heading } from '../Heading';

describe('Heading', () => {
  it('renders with correct level and content', () => {
    render(<Heading level={1}>Test Heading</Heading>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Heading');
  });

  it('renders with different levels', () => {
    const { rerender } = render(<Heading level={2}>Level 2</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(<Heading level={3}>Level 3</Heading>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(
      <Heading level={1} sx={{ color: 'red' }}>
        Styled Heading
      </Heading>
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('uses custom component when provided', () => {
    render(
      <Heading level={1} component="h3">
        Custom Component
      </Heading>
    );
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Custom Component');
  });
});
