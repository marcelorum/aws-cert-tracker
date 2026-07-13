import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calcExamPace } from '../../src/lib/progress';

beforeEach(() => {
  // Freeze time to 2026-07-12 for deterministic tests
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-12T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('calcExamPace', () => {
  it('returns no_date when targetDate is null', () => {
    const result = calcExamPace({
      targetDate: null,
      dateSet: null,
      totalTopics: 50,
      completedTopics: 0,
    });
    expect(result.status).toBe('no_date');
    expect(result.daysRemaining).toBeNull();
    expect(result.daysElapsed).toBeNull();
    expect(result.targetPerDay).toBe(0);
    expect(result.actualPerDay).toBe(0);
    expect(result.ratio).toBeNull();
  });

  it('returns complete when all topics are done', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet: Date.now(),
      totalTopics: 50,
      completedTopics: 50,
    });
    expect(result.status).toBe('complete');
    expect(result.ratio).toBeNull();
  });

  it('returns exam_passed when the exam date has passed', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const dateStr = pastDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet: Date.now(),
      totalTopics: 50,
      completedTopics: 10,
    });
    expect(result.status).toBe('exam_passed');
    expect(result.daysRemaining).toBeLessThan(0);
  });

  it('returns exam_passed when exam is today', () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const result = calcExamPace({
      targetDate: dateStr,
      dateSet: Date.now(),
      totalTopics: 50,
      completedTopics: 10,
    });
    expect(result.status).toBe('exam_passed');
    expect(result.daysRemaining).toBe(0);
  });

  it('returns ahead when ratio >= 1.0', () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const dateSet = midnight.getTime() - 10 * 24 * 60 * 60 * 1000;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 40);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet,
      totalTopics: 50,
      completedTopics: 10,
    });
    expect(result.status).toBe('ahead');
    expect(result.ratio).toBeGreaterThanOrEqual(1.0);
  });

  it('returns on_track when ratio >= 0.9 and < 1.0', () => {
    // 9 completed in 10 days = 0.9/day actual
    // 31 remaining, 31 days left = 1.0/day needed
    // ratio = 0.9 / 1.0 = 0.9 → on_track
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const dateSet = midnight.getTime() - 10 * 24 * 60 * 60 * 1000;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 31);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet,
      totalTopics: 40,
      completedTopics: 9,
    });
    expect(result.status).toBe('on_track');
    expect(result.ratio).toBeGreaterThanOrEqual(0.9);
    expect(result.ratio).toBeLessThan(1.0);
  });

  it('returns behind when ratio < 0.9', () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const dateSet = midnight.getTime() - 10 * 24 * 60 * 60 * 1000; // 10 days ago at midnight

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 40);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet,
      totalTopics: 50,
      completedTopics: 2,
    });
    expect(result.status).toBe('behind');
    expect(result.ratio).toBeLessThan(0.9);
  });

  it('handles legacy data with no dateSet', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 40);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet: null,
      totalTopics: 50,
      completedTopics: 5,
    });
    expect(result.daysElapsed).toBe(0);
    expect(result.actualPerDay).toBe(0);
    expect(result.status).toBe('behind');
  });

  it('handles zero topics without crashing', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet: Date.now(),
      totalTopics: 0,
      completedTopics: 0,
    });
    // With 0 topics, totalTopics > 0 is false, so it falls through
    // to pace calculation. targetPerDay = 0, actualPerDay = 0, ratio = 0 → behind
    expect(result.status).toBe('behind');
    expect(result.ratio).toBe(0);
  });

  it('handles exam passed long ago with negative days', () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const dateSet = midnight.getTime() - 120 * 24 * 60 * 60 * 1000; // 120 days ago at midnight

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 100);
    const dateStr = pastDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet,
      totalTopics: 50,
      completedTopics: 30,
    });
    expect(result.status).toBe('exam_passed');
    expect(result.daysRemaining).toBeLessThan(0);
  });

  it('handles just-set date with zero elapsed days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().slice(0, 10);

    const result = calcExamPace({
      targetDate: dateStr,
      dateSet: Date.now(),
      totalTopics: 50,
      completedTopics: 0,
    });
    expect(result.daysElapsed).toBe(0);
    expect(result.actualPerDay).toBe(0);
    expect(result.status).toBe('behind');
  });

  it('flags invalid date format without crashing', () => {
    const result = calcExamPace({
      targetDate: 'not-a-date',
      dateSet: Date.now(),
      totalTopics: 50,
      completedTopics: 10,
    });
    expect(result.status).toBe('no_date');
    expect(result.invalidDate).toBe(true);
    expect(result.daysRemaining).toBeNull();
  });
});