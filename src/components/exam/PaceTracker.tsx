import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { PaceStatus } from '../../lib/progress';

interface PaceTrackerProps {
  pace: {
    targetPerDay: number;
    actualPerDay: number;
    ratio: number | null;
    status: PaceStatus;
  };
}

export function PaceTracker({ pace }: PaceTrackerProps) {
  const { status, targetPerDay, actualPerDay, ratio } = pace;

  // Complete state
  if (status === 'complete') {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">All topics complete!</span>
      </div>
    );
  }

  // Exam has passed
  if (status === 'exam_passed') {
    return (
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Exam date has passed
      </p>
    );
  }

  // No date — don't render
  if (status === 'no_date') return null;

  // Ahead / on_track / behind — render pace bar
  const barColor =
    status === 'ahead'
      ? 'bg-green-500'
      : status === 'on_track'
        ? 'bg-amber-500'
        : 'bg-red-500';

  const statusLabel =
    status === 'ahead'
      ? 'Ahead'
      : status === 'on_track'
        ? 'On track'
        : 'Behind';

  const StatusIcon =
    status === 'ahead'
      ? CheckCircle
      : status === 'on_track'
        ? Info
        : AlertTriangle;

  const fillWidth = ratio !== null ? Math.min(ratio, 1) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {targetPerDay.toFixed(1)}/day needed
        </span>
        <span>
          {actualPerDay.toFixed(1)}/day actual
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
      <div className="flex items-center gap-1 text-xs font-medium">
        <StatusIcon className={`w-3.5 h-3.5 ${
          status === 'ahead'
            ? 'text-green-600 dark:text-green-400'
            : status === 'on_track'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
        }`} />
        <span className={
          status === 'ahead'
            ? 'text-green-600 dark:text-green-400'
            : status === 'on_track'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
        }>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}