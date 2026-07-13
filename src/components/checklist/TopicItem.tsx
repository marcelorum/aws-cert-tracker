import { useNavigate } from 'react-router';
import { ExternalLink } from 'lucide-react';
import type { Topic } from '../../lib/types';
import { StatusBadge } from './StatusBadge';

interface TopicItemProps {
  topic: Topic;
}

export function TopicItem({ topic }: TopicItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/topic/${topic.id}`);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
      onClick={handleClick}
    >
      <span className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
          {topic.name}
        </span>
        {topic.description && (
          <span className="block text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {topic.description}
          </span>
        )}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge topicId={topic.id!} status={topic.status} />
        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors dark:text-gray-600 dark:group-hover:text-gray-400" />
      </div>
    </div>
  );
}
