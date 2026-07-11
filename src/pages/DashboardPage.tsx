import { useEffect, useMemo, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { useDomains, useAllTopics } from '../db/hooks';
import { useUIStore } from '../stores/ui-store';
import { ProgressRing } from '../components/progress/ProgressRing';
import { ProgressBar } from '../components/progress/ProgressBar';
import { seedDatabase } from '../db/seed-data';
import { calcOverallProgress, calcDomainProgress } from '../lib/progress';

export function DashboardPage() {
  const domains = useDomains();
  const allTopics = useAllTopics();
  const expandDomain = useUIStore((s) => s.expandDomain);
  const seeded = useRef(false);
  const overallProgress = useMemo(
    () => calcOverallProgress(allTopics),
    [allTopics],
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your AWS Cloud Practitioner (CLF-C02) study progress
        </p>
      </div>

      {/* Overall Progress Ring */}
      <div className="flex flex-col items-center py-6">
        <div className="relative inline-flex items-center justify-center">
          <ProgressRing percentage={overallProgress} size={140} strokeWidth={16} />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Overall Progress (by individual topics)
        </p>
      </div>

      {/* Domain Progress Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Exam Domains
        </h2>

        {domains.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <p className="text-sm text-gray-400">Loading domains...</p>
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
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => expandDomain(domain.id!)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">
                    {domain.name}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {domain.weight}% of exam
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {completed}/{total}
                </span>
              </div>
              <ProgressBar ratio={ratio} />
              <p className="text-xs text-gray-400 mt-1">
                {Math.round(ratio * 100)}% complete
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
