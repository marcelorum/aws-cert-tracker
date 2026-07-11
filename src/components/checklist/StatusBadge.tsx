import type { TopicStatus } from '../../lib/types';
import {
  getStatusLabel,
  getStatusColor,
  getNextStatus,
} from '../../lib/utils';
import { cn } from '../../lib/utils';
import { updateTopicStatus } from '../../db/hooks';

interface StatusBadgeProps {
  topicId: number;
  status: TopicStatus;
}

export function StatusBadge({ topicId, status }: StatusBadgeProps) {
  const nextStatus = getNextStatus(status);

  const handleClick = async () => {
    if (nextStatus) {
      await updateTopicStatus(topicId, nextStatus);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={`Click to ${status === 'completed' ? 'reset to' : 'mark as'} ${getStatusLabel(nextStatus!)}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer',
        getStatusColor(status),
        'hover:opacity-80 active:scale-95',
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'not_started' && 'bg-gray-400',
          status === 'in_progress' && 'bg-amber-500',
          status === 'completed' && 'bg-green-500',
        )}
      />
      {getStatusLabel(status)}
    </button>
  );
}
