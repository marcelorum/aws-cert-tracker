import { cn } from '../../lib/utils';

interface ProgressBarProps {
  ratio: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({ ratio, size = 'md', className }: ProgressBarProps) {
  const clampedRatio = Math.min(1, Math.max(0, ratio));
  const percentage = Math.round(clampedRatio * 100);

  return (
    <div
      className={cn(
        'w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden',
        size === 'sm' ? 'h-1.5' : 'h-2.5',
        className,
      )}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
