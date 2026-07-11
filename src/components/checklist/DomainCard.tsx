import { useMemo } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Domain, Topic as TopicType } from '../../lib/types';
import { useUIStore } from '../../stores/ui-store';
import { useTopics, useAllTopics } from '../../db/hooks';
import { ProgressBar } from '../progress/ProgressBar';
import { TopicItem } from './TopicItem';

interface DomainCardProps {
  domain: Domain;
}

function groupSubTopics(
  topLevelTopics: TopicType[],
  allTopics: TopicType[],
): Map<number, TopicType[]> {
  const map = new Map<number, TopicType[]>();
  for (const topic of topLevelTopics) {
    const subs = allTopics.filter((t) => t.parentTopicId === topic.id);
    if (subs.length > 0) map.set(topic.id!, subs);
  }
  return map;
}

export function DomainCard({ domain }: DomainCardProps) {
  const expandedDomains = useUIStore((s) => s.expandedDomains);
  const toggleDomain = useUIStore((s) => s.toggleDomain);
  const expandedTopics = useUIStore((s) => s.expandedTopics);
  const isExpanded = expandedDomains.has(domain.id!);

  const topics = useTopics(domain.id);
  const allTopics = useAllTopics();

  const subTopicMap = useMemo(
    () => groupSubTopics(topics, allTopics),
    [topics, allTopics],
  );

  const total = topics.length;
  const completed = topics.filter((t) => t.status === 'completed').length;
  const ratio = total > 0 ? completed / total : 0;

  const handleToggle = () => {
    toggleDomain(domain.id!);
  };

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={handleToggle}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <Collapsible.Trigger className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left">
        <span className="text-gray-400 flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-gray-900 text-sm">
              {domain.name}
            </span>
            <span className="text-xs text-gray-500 font-medium flex-shrink-0">
              {domain.weight}%
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar ratio={ratio} size="sm" />
          </div>
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {topics.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No topics yet.</p>
          )}
          {topics.map((topic) => {
            const subTopics = subTopicMap.get(topic.id!) ?? [];
            const isTopicExpanded = expandedTopics.has(topic.id!);

            return (
              <div key={topic.id}>
                <TopicItem key={topic.id} topic={topic} />
                {subTopics.length > 0 && (
                  <Collapsible.Root
                    open={isTopicExpanded}
                    onOpenChange={() =>
                      useUIStore.getState().toggleTopic(topic.id!)
                    }
                  >
                    <Collapsible.Content>
                      <div className="ml-8 border-l border-gray-100 pl-4 divide-y divide-gray-50">
                        {subTopics.map((st) => (
                          <TopicItem key={st.id} topic={st} />
                        ))}
                      </div>
                    </Collapsible.Content>
                  </Collapsible.Root>
                )}
              </div>
            );
          })}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
