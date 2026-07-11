import { describe, it, expect } from 'vitest';
import { calcOverallProgress, calcDomainProgress } from '../../src/lib/progress';

describe('calcOverallProgress', () => {
  it('returns 0 for empty topics', () => {
    expect(calcOverallProgress([])).toBe(0);
  });

  it('returns 0 when no topics are completed', () => {
    const topics = [
      { status: 'not_started', domainId: 1 },
      { status: 'in_progress', domainId: 1 },
    ];
    expect(calcOverallProgress(topics)).toBe(0);
  });

  it('returns 100 when all topics are completed', () => {
    const topics = [
      { status: 'completed', domainId: 1 },
      { status: 'completed', domainId: 2 },
    ];
    expect(calcOverallProgress(topics)).toBe(100);
  });

  it('calculates correct percentage for partial completion', () => {
    const topics = [
      { status: 'completed', domainId: 1 },
      { status: 'completed', domainId: 1 },
      { status: 'not_started', domainId: 2 },
      { status: 'in_progress', domainId: 2 },
    ];
    expect(calcOverallProgress(topics)).toBe(50);
  });

  it('treats all topics equally regardless of domain', () => {
    const topics = [
      { status: 'completed', domainId: 1 },
      { status: 'completed', domainId: 2 },
      { status: 'completed', domainId: 2 },
      { status: 'not_started', domainId: 2 },
    ];
    expect(calcOverallProgress(topics)).toBe(75);
  });

  it('returns non-integer for uneven ratios', () => {
    const topics = [
      { status: 'completed', domainId: 1 },
      { status: 'not_started', domainId: 1 },
      { status: 'not_started', domainId: 1 },
    ];
    expect(calcOverallProgress(topics)).toBeCloseTo(33.33, 1);
  });
});

describe('calcDomainProgress', () => {
  const topics = [
    { status: 'completed', domainId: 1 },
    { status: 'in_progress', domainId: 1 },
    { status: 'not_started', domainId: 1 },
    { status: 'completed', domainId: 2 },
  ];

  it('counts total topics for the domain', () => {
    const result = calcDomainProgress(topics, 1);
    expect(result.total).toBe(3);
  });

  it('counts completed topics for the domain', () => {
    const result = calcDomainProgress(topics, 1);
    expect(result.completed).toBe(1);
  });

  it('calculates correct ratio', () => {
    const result = calcDomainProgress(topics, 1);
    expect(result.ratio).toBeCloseTo(0.333, 2);
  });

  it('returns 0 for domain with no matching topics', () => {
    const result = calcDomainProgress(topics, 99);
    expect(result).toEqual({ total: 0, completed: 0, ratio: 0 });
  });

  it('isolates domains correctly', () => {
    const d1 = calcDomainProgress(topics, 1);
    const d2 = calcDomainProgress(topics, 2);
    expect(d1.total).toBe(3);
    expect(d2.total).toBe(1);
    expect(d2.completed).toBe(1);
    expect(d2.ratio).toBe(1);
  });
});
