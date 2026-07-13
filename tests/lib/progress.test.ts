import { describe, it, expect } from 'vitest';
import { calcOverallProgress, calcWeightedOverallProgress, calcDomainProgress } from '../../src/lib/progress';

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

describe('calcWeightedOverallProgress', () => {
  it('returns 0 for empty topics', () => {
    const domains = [{ id: 1, weight: 100 }];
    expect(calcWeightedOverallProgress([], domains)).toBe(0);
  });

  it('returns 0 for empty domains', () => {
    const topics = [{ status: 'completed', domainId: 1 }];
    expect(calcWeightedOverallProgress(topics, [])).toBe(0);
  });

  it('returns 0 when no topics are completed', () => {
    const topics = [
      { status: 'not_started', domainId: 1 },
      { status: 'in_progress', domainId: 1 },
    ];
    const domains = [{ id: 1, weight: 100 }];
    expect(calcWeightedOverallProgress(topics, domains)).toBe(0);
  });

  it('returns 100 when all topics are completed', () => {
    const topics = [
      { status: 'completed', domainId: 1 },
      { status: 'completed', domainId: 2 },
    ];
    const domains = [
      { id: 1, weight: 24 },
      { id: 2, weight: 34 },
    ];
    expect(calcWeightedOverallProgress(topics, domains)).toBe(100);
  });

  it('matches the spec scenario — 30% result', () => {
    const topics = [
      // Domain A (30% weight) — 10/10 completed
      ...Array.from({ length: 10 }, () => ({ status: 'completed' as const, domainId: 1 })),
      // Domain B (50% weight) — 0/10 completed
      ...Array.from({ length: 10 }, () => ({ status: 'not_started' as const, domainId: 2 })),
      // Domain C (20% weight) — 0/10 completed
      ...Array.from({ length: 10 }, () => ({ status: 'not_started' as const, domainId: 3 })),
    ];
    const domains = [
      { id: 1, weight: 30 },
      { id: 2, weight: 50 },
      { id: 3, weight: 20 },
    ];
    // (1.0 × 30 + 0 × 50 + 0 × 20) / 100 × 100 = 30%
    expect(calcWeightedOverallProgress(topics, domains)).toBeCloseTo(30, 2);
  });

  it('excludes zero-topic domains from the total weight', () => {
    const topics = [
      { status: 'completed', domainId: 1 },
      { status: 'not_started', domainId: 1 },
    ];
    const domains = [
      { id: 1, weight: 60 },
      { id: 2, weight: 40 },
    ];
    // Only domain 1 has topics: (0.5 × 60) / 60 × 100 = 50%
    expect(calcWeightedOverallProgress(topics, domains)).toBeCloseTo(50, 2);
  });

  it('diverges from flat mode with asymmetric topic distribution', () => {
    // Domain A: 6 topics, all completed, 24% weight
    // Domain B: 10 topics, none completed, 34% weight
    const topics = [
      ...Array.from({ length: 6 }, () => ({ status: 'completed' as const, domainId: 1 })),
      ...Array.from({ length: 10 }, () => ({ status: 'not_started' as const, domainId: 2 })),
    ];
    const domains = [
      { id: 1, weight: 24 },
      { id: 2, weight: 34 },
    ];
    // Weighted: (1.0 × 24 + 0 × 34) / (24 + 34) × 100 = 2400/58 ≈ 41.38
    const weighted = calcWeightedOverallProgress(topics, domains);
    // Flat: (6 + 0) / (6 + 10) × 100 = 37.5
    const flat = calcOverallProgress(topics);
    expect(weighted).toBeCloseTo(41.38, 1);
    expect(flat).toBeCloseTo(37.5, 1);
    expect(weighted).not.toBeCloseTo(flat, 0);
  });

  it('handles partial across a single domain', () => {
    const topics = [
      { status: 'completed', domainId: 1 },
      { status: 'completed', domainId: 1 },
      { status: 'not_started', domainId: 1 },
    ];
    const domains = [{ id: 1, weight: 100 }];
    expect(calcWeightedOverallProgress(topics, domains)).toBeCloseTo(66.67, 1);
  });
});
