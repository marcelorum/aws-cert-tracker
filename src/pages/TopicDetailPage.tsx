import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useTopic } from '../db/hooks';
import { StatusBadge } from '../components/checklist/StatusBadge';
import { ResourceForm } from '../components/resources/ResourceForm';
import { ResourceList } from '../components/resources/ResourceList';

export function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const topic = useTopic(Number(topicId));

  if (!topicId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No topic selected.</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <p className="text-gray-400">Loading topic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/checklist')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Checklist
      </button>

      {/* Topic header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
          <StatusBadge topicId={topic.id!} status={topic.status} />
        </div>
        <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
      </div>

      {/* Resources section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Resources</h2>
        </div>

        <ResourceList topicId={topic.id!} />
        <ResourceForm topicId={topic.id!} />
      </section>
    </div>
  );
}
