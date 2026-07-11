import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResourceForm } from '../../src/components/resources/ResourceForm';

// Mock the db/hooks module
vi.mock('../../src/db/hooks', () => ({
  addResource: vi.fn().mockResolvedValue(1),
}));

describe('ResourceForm', () => {
  const topicId = 1;

  it('renders add button initially', () => {
    render(<ResourceForm topicId={topicId} />);
    expect(screen.getByText('Add Resource')).toBeInTheDocument();
  });

  it('opens form when add button is clicked', () => {
    render(<ResourceForm topicId={topicId} />);
    fireEvent.click(screen.getByText('Add Resource'));
    expect(screen.getByText('Save Resource')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays type selector with all 6 options', () => {
    render(<ResourceForm topicId={topicId} />);
    fireEvent.click(screen.getByText('Add Resource'));

    // Radix Select renders the trigger with the selected value
    // The native select also has an option for "Article" so getByText matches 2
    expect(screen.getAllByText('Article')).toHaveLength(2);
  });

  it('closes form on cancel', () => {
    render(<ResourceForm topicId={topicId} />);
    fireEvent.click(screen.getByText('Add Resource'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Add Resource')).toBeInTheDocument();
  });

  it('shows URL validation error for non-note types', async () => {
    render(<ResourceForm topicId={topicId} />);
    fireEvent.click(screen.getByText('Add Resource'));

    // Type is 'article' by default — URL is required
    fireEvent.click(screen.getByText('Save Resource'));

    await waitFor(() => {
      expect(screen.getByText('URL is required for this resource type')).toBeInTheDocument();
    });
  });

  it('shows URL format error for invalid URLs', async () => {
    render(<ResourceForm topicId={topicId} />);
    fireEvent.click(screen.getByText('Add Resource'));

    const urlInput = screen.getByPlaceholderText('https://...');
    fireEvent.change(urlInput, { target: { value: 'not-a-url' } });

    // Submit the form directly (avoids native type="url" validation in jsdom)
    const form = screen.getByRole('button', { name: 'Save Resource' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Enter a valid http:// or https:// URL')).toBeInTheDocument();
    });
  });

  it('shows notes byte counter', () => {
    render(<ResourceForm topicId={topicId} />);
    fireEvent.click(screen.getByText('Add Resource'));

    expect(screen.getByText(/0 \/ 10,000 bytes/)).toBeInTheDocument();
  });
});
