import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders with title and description', () => {
    render(
      <EmptyState
        title="No Data Found"
        description="There are no items to display"
      />
    );
    
    expect(screen.getByText('No Data Found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(
      <EmptyState
        title="Custom Icon"
        description="With custom icon"
        icon="🚀"
      />
    );
    
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const mockAction = vi.fn();
    render(
      <EmptyState
        title="With Action"
        description="Click the button"
        primaryAction={{
          label: 'Add Item',
          onClick: mockAction,
        }}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    
    button.click();
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('renders with custom size', () => {
    render(
      <EmptyState
        title="Small Size"
        description="Small empty state"
        size="small"
      />
    );
    
    const container = screen.getByText('Small Size').closest('div');
    expect(container).toHaveClass('MuiBox-root');
  });

  it('applies custom styles', () => {
    render(
      <EmptyState
        title="Styled"
        description="With custom styles"
        sx={{ backgroundColor: 'red' }}
      />
    );
    
    const container = screen.getByText('Styled').closest('div');
    expect(container).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
  });
});
