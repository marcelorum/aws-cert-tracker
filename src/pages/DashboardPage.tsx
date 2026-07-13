import { useEffect, useMemo, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { useDomains, useAllTopics, useExamSchedule } from '../db/hooks';
import { useUIStore } from '../stores/ui-store';
import { ProgressRing } from '../components/progress/ProgressRing';
import { ProgressBar } from '../components/progress/ProgressBar';
import { ExamDatePicker } from '../components/exam/ExamDatePicker';
import { CountdownBadge } from '../components/exam/CountdownBadge';
import { PaceTracker } from '../components/exam/PaceTracker';
import { seedDatabase } from '../db/seed-data';
import { calcOverallProgress, calcWeightedOverallProgress, calcDomainProgress } from '../lib/progress';

export function DashboardPage() {
  const domains = useDomains();
  const allTopics = useAllTopics();
  const examSchedule = useExamSchedule();
  const expandDomain = useUIStore((s) => s.expandDomain);
  const progressMode = useUIStore((s) => s.progressMode);
  const setProgressMode = useUIStore((s) => s.setProgressMode);
  const seeded = useRef(false);
  const overallProgress = useMemo(
    () =>
      progressMode === 'flat'
        ? calcOverallProgress(allTopics)
        : calcWeightedOverallProgress(
            allTopics,
            domains.map((d) => ({ id: d.id!, weight: d.weight })),
          ),
    [allTopics, domains, progressMode],
  );

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    seedDatabase();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track your AWS Cloud Practitioner (CLF-C02) study progress
        </p>
      </div>

      {/* Overall Progress Ring */}
      <div className="flex flex-col items-center py-6">
        <div className="relative inline-flex items-center justify-center">
          <ProgressRing percentage={overallProgress} size={140} strokeWidth={16} />
        </div>

        {/* Mode toggle */}
        <div className="mt-4 inline-flex rounded-md shadow-xs" role="group" aria-label="Progress calculation mode">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-l-md border ${
              progressMode === 'flat'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setProgressMode('flat')}
          >
            Flat
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-r-md border-t border-b border-r ${
              progressMode === 'weighted'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setProgressMode('weighted')}
          >
            Weighted
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Overall Progress ({progressMode === 'flat' ? 'Flat' : 'Weighted'})
        </p>
      </div>

      {/* Exam Schedule Card */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Exam Schedule
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <ExamDatePicker />
        </div>

        {examSchedule.targetDate && examSchedule.pace.invalidDate && (
          <p className="text-xs text-red-500 dark:text-red-400">
            Stored date is invalid. Set a new date below.
          </p>
        )}
        {examSchedule.targetDate && !examSchedule.pace.invalidDate && (
          <>
            <CountdownBadge
              daysRemaining={examSchedule.daysRemaining}
              hasDate={!!examSchedule.targetDate}
            />
            {examSchedule.pace.status !== 'no_date' && (
              <PaceTracker pace={examSchedule.pace} />
            )}
          </>
        )}
      </div>

      {/* Domain Progress Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Exam Domains
        </h2>

        {domains.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Loading domains...</p>
            </div>
          </div>
        )}

        {domains.map((domain) => {
          const { ratio, total, completed } = calcDomainProgress(
            allTopics,
            domain.id!,
          );
          return (
            <div
              key={domain.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => expandDomain(domain.id!)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900 text-sm dark:text-gray-100">
                    {domain.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    {domain.weight}% of exam
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {completed}/{total}
                </span>
              </div>
              <ProgressBar ratio={ratio} />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {Math.round(ratio * 100)}% complete
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
