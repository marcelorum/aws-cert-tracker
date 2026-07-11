import { useResources } from '../../db/hooks';
import { ResourceItem } from './ResourceItem';

interface ResourceListProps {
  topicId: number;
}

export function ResourceList({ topicId }: ResourceListProps) {
  const resources = useResources(topicId);

  if (resources.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No resources yet. Add a video, article, or note to track your study materials.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {resources.map((resource) => (
        <ResourceItem
          key={resource.id}
          resource={resource}
          onDelete={() => {
            // Reactivity handled by liveQuery
          }}
        />
      ))}
    </div>
  );
}
