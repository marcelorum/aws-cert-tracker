import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../../src/components/progress/ProgressBar';

describe('ProgressBar', () => {
  it('renders with progress role', () => {
    render(<ProgressBar ratio={0.5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
  });

  it('sets aria values correctly for 50%', () => {
    render(<ProgressBar ratio={0.5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders full progress', () => {
    render(<ProgressBar ratio={1} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders empty progress', () => {
    render(<ProgressBar ratio={0} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps ratio above 1', () => {
    render(<ProgressBar ratio={1.5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps ratio below 0', () => {
    render(<ProgressBar ratio={-0.5} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies sm size class', () => {
    const { container } = render(<ProgressBar ratio={0.3} size="sm" />);
    const bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain('h-1.5');
  });

  it('applies md size class', () => {
    const { container } = render(<ProgressBar ratio={0.3} size="md" />);
    const bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain('h-2.5');
  });
});
