export interface TopicSummary {
  status: string;
  domainId: number;
}

export function calcOverallProgress(topics: TopicSummary[]): number {
  if (topics.length === 0) return 0;
  const completed = topics.filter((t) => t.status === 'completed').length;
  return (completed / topics.length) * 100;
}

export function calcDomainProgress(
  topics: TopicSummary[],
  domainId: number,
): { total: number; completed: number; ratio: number } {
  const domainTopics = topics.filter((t) => t.domainId === domainId);
  const total = domainTopics.length;
  const completed = domainTopics.filter((t) => t.status === 'completed').length;
  return { total, completed, ratio: total > 0 ? completed / total : 0 };
}
