export interface TopicSummary {
  status: string;
  domainId: number;
}

export function calcOverallProgress(topics: TopicSummary[]): number {
  if (topics.length === 0) return 0;
  const completed = topics.filter((t) => t.status === 'completed').length;
  return (completed / topics.length) * 100;
}

export function calcWeightedOverallProgress(
  topics: TopicSummary[],
  domains: { id: number; weight: number }[],
): number {
  if (topics.length === 0 || domains.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const domain of domains) {
    const domainTopics = topics.filter((t) => t.domainId === domain.id);
    const total = domainTopics.length;
    if (total === 0) continue; // zero-topic domain contributes nothing
    const completed = domainTopics.filter((t) => t.status === 'completed').length;
    const ratio = completed / total;
    weightedSum += ratio * domain.weight;
    totalWeight += domain.weight;
  }

  if (totalWeight === 0) return 0;
  return (weightedSum / totalWeight) * 100;
}

export function calcDomainProgress(
  topics: TopicSummary[],
  domainId: number,
): { total: number; completed: number; ratio: number } {
  const domainTopics = topics.filter((t) => t.domainId === domainId);
  const total = domainTopics.length;
  const completed = domainTopics.filter((t) => t.status === 'completed').length;
  return { total, completed, ratio: total > 0 ? completed / total : 0 };
}

export type PaceStatus = 'ahead' | 'on_track' | 'behind' | 'complete' | 'no_date' | 'exam_passed';

export interface ExamPaceInput {
  targetDate: string | null;
  dateSet: number | null;
  totalTopics: number;
  completedTopics: number;
}

export interface ExamPaceResult {
  daysRemaining: number | null;
  daysElapsed: number | null;
  targetPerDay: number;
  actualPerDay: number;
  ratio: number | null;
  status: PaceStatus;
  invalidDate: boolean;
}

const DAY_MS = 1000 * 60 * 60 * 24;

const MIN_YEAR = 2024;
const MAX_YEAR = 2099;

/** Parse a YYYY-MM-DD string to a Date at local midnight. Returns null if invalid or out of range. */
function parseDate(str: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const year = parseInt(str.slice(0, 4), 10);
  if (year < MIN_YEAR || year > MAX_YEAR) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export function calcExamPace(input: ExamPaceInput): ExamPaceResult {
  const { targetDate, dateSet, totalTopics, completedTopics } = input;

  // No date set
  if (!targetDate) {
    return {
      daysRemaining: null,
      daysElapsed: null,
      targetPerDay: 0,
      actualPerDay: 0,
      ratio: null,
      status: 'no_date',
      invalidDate: false,
    };
  }

  const parsed = parseDate(targetDate);
  if (!parsed) {
    // Invalid date format — treat as no_date and flag it
    return {
      daysRemaining: null,
      daysElapsed: null,
      targetPerDay: 0,
      actualPerDay: 0,
      ratio: null,
      status: 'no_date',
      invalidDate: true,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = parsed.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffMs / DAY_MS);

  let daysElapsed: number | null = null;
  if (dateSet) {
    const start = new Date(dateSet);
    start.setHours(0, 0, 0, 0);
    daysElapsed = Math.ceil((today.getTime() - start.getTime()) / DAY_MS);
  } else {
    daysElapsed = 0; // legacy data — no dateSet tracked
  }

  const remainingTopics = totalTopics - completedTopics;

  // All topics complete
  if (totalTopics > 0 && completedTopics >= totalTopics) {
    return {
      daysRemaining,
      daysElapsed,
      targetPerDay: 0,
      actualPerDay: 0,
      ratio: null,
      status: 'complete',
      invalidDate: false,
    };
  }

  // Exam date has passed
  if (daysRemaining < 0) {
    return {
      daysRemaining,
      daysElapsed,
      targetPerDay: 0,
      actualPerDay: 0,
      ratio: null,
      status: 'exam_passed',
      invalidDate: false,
    };
  }

  // Exam is today
  if (daysRemaining === 0) {
    return {
      daysRemaining,
      daysElapsed,
      targetPerDay: 0,
      actualPerDay: 0,
      ratio: null,
      status: 'exam_passed',
      invalidDate: false,
    };
  }

  const targetPerDay = remainingTopics / daysRemaining;
  const actualPerDay = daysElapsed > 0 ? completedTopics / daysElapsed : 0;
  const ratio = targetPerDay > 0 ? actualPerDay / targetPerDay : 0;

  let status: PaceStatus;
  if (ratio >= 1.0) {
    status = 'ahead';
  } else if (ratio >= 0.9) {
    status = 'on_track';
  } else {
    status = 'behind';
  }

  return {
    daysRemaining,
    daysElapsed,
    targetPerDay,
    actualPerDay,
    ratio,
    status,
    invalidDate: false,
  };
}
