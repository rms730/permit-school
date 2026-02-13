import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { StatusChip } from '../StatusChip';

describe('StatusChip', () => {
  it('renders with correct status and label', () => {
    render(<StatusChip status="success" label="Active" />);
    const chip = screen.getByText('Active');
    expect(chip).toBeInTheDocument();
  });

  it('renders with different status types', () => {
    const { rerender } = render(<StatusChip status="error" label="Failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();

    rerender(<StatusChip status="warning" label="Pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();

    rerender(<StatusChip status="info" label="Processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('applies correct color based on status', () => {
    render(<StatusChip status="success" label="Success" />);
    const chip = screen.getByText('Success').closest('[class*="MuiChip-root"]');
    expect(chip).toHaveClass('MuiChip-colorSuccess');
  });

  it('renders with custom size', () => {
    render(<StatusChip status="info" label="Info" size="small" />);
    const chip = screen.getByText('Info').closest('[class*="MuiChip-root"]');
    expect(chip).toHaveClass('MuiChip-sizeSmall');
  });

  it('renders with custom variant', () => {
    render(<StatusChip status="warning" label="Warning" variant="outlined" />);
    const chip = screen.getByText('Warning').closest('[class*="MuiChip-root"]');
    expect(chip).toHaveClass('MuiChip-outlined');
  });
});
