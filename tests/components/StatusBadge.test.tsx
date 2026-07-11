import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBadge } from '../../src/components/checklist/StatusBadge';
import { TOPIC_STATUS_LABELS } from '../../src/lib/types';

// Mock the db/hooks module
const mockUpdate = vi.fn().mockResolvedValue(undefined);
vi.mock('../../src/db/hooks', () => ({
  updateTopicStatus: (...args: unknown[]) => mockUpdate(...args),
}));

describe('StatusBadge', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it('renders with not_started status', () => {
    render(<StatusBadge topicId={1} status="not_started" />);
    expect(screen.getByText(TOPIC_STATUS_LABELS.not_started)).toBeInTheDocument();
  });

  it('renders with in_progress status', () => {
    render(<StatusBadge topicId={1} status="in_progress" />);
    expect(screen.getByText(TOPIC_STATUS_LABELS.in_progress)).toBeInTheDocument();
  });

  it('renders with completed status', () => {
    render(<StatusBadge topicId={1} status="completed" />);
    expect(screen.getByText(TOPIC_STATUS_LABELS.completed)).toBeInTheDocument();
  });

  it('is a button element', () => {
    render(<StatusBadge topicId={1} status="not_started" />);
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('cycles forward: not_started → in_progress', () => {
    render(<StatusBadge topicId={5} status="not_started" />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockUpdate).toHaveBeenCalledWith(5, 'in_progress');
  });

  it('cycles forward: in_progress → completed', () => {
    render(<StatusBadge topicId={5} status="in_progress" />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockUpdate).toHaveBeenCalledWith(5, 'completed');
  });

  it('resets: completed → not_started', () => {
    render(<StatusBadge topicId={5} status="completed" />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockUpdate).toHaveBeenCalledWith(5, 'not_started');
  });
});
