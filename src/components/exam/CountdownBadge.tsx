interface CountdownBadgeProps {
  daysRemaining: number | null;
  hasDate: boolean;
}

export function CountdownBadge({ daysRemaining, hasDate }: CountdownBadgeProps) {
  if (!hasDate || daysRemaining === null) return null;

  const text =
    daysRemaining > 0
      ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} until exam`
      : daysRemaining === 0
        ? 'Exam is today!'
        : `Exam was ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago`;

  const colorClass =
    daysRemaining === 0
      ? 'text-green-600 dark:text-green-400'
      : daysRemaining < 0
        ? 'text-gray-500 dark:text-gray-400'
        : 'text-blue-600 dark:text-blue-400';

  return (
    <p className={`text-sm font-medium ${colorClass}`}>
      {text}
    </p>
  );
}