import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from '../../src/components/progress/ProgressRing';

describe('ProgressRing', () => {
  it('renders with progress role and correct value', () => {
    render(<ProgressRing percentage={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders the percentage text', () => {
    render(<ProgressRing percentage={42} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('clamps values above 100', () => {
    render(<ProgressRing percentage={150} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps values below 0', () => {
    render(<ProgressRing percentage={-10} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('applies custom size and strokeWidth', () => {
    const { container } = render(
      <ProgressRing percentage={50} size={200} strokeWidth={16} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '200');
  });

  it('renders with optional label', () => {
    render(<ProgressRing percentage={60} label="Overall Progress" />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});
