import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './schema';
import type { Domain, Topic, Resource } from '../lib/types';

export function useDomains(examId?: number): Domain[] {
  return useLiveQuery(
    () => {
      if (examId === undefined) return db.domain.toArray();
      return db.domain.where('examId').equals(examId).sortBy('order');
    },
    [examId],
    [],
  );
}

export function useTopics(domainId?: number): Topic[] {
  return useLiveQuery(
    () => {
      if (domainId === undefined) return db.topic.toArray();
      return db.topic.where('domainId').equals(domainId).sortBy('order');
    },
    [domainId],
    [],
  );
}

export function useSubTopics(parentTopicId?: number): Topic[] {
  return useLiveQuery(
    () => {
      if (parentTopicId === undefined) return [];
      return db.topic.where('parentTopicId').equals(parentTopicId).sortBy('order');
    },
    [parentTopicId],
    [],
  );
}

export function useTopic(topicId?: number): Topic | undefined {
  return useLiveQuery(
    () => {
      if (topicId === undefined) return undefined;
      return db.topic.get(topicId);
    },
    [topicId],
    undefined,
  );
}

export function useAllTopics(): Topic[] {
  return useLiveQuery(() => db.topic.toArray(), [], []);
}

export function useResources(topicId?: number): Resource[] {
  return useLiveQuery(
    () => {
      if (topicId === undefined) return [];
      return db.resource.where('topicId').equals(topicId).toArray();
    },
    [topicId],
    [],
  );
}

export async function updateTopicStatus(
  topicId: number,
  status: Topic['status'],
): Promise<void> {
  await db.topic.update(topicId, { status });
}

export async function addResource(
  resource: Omit<Resource, 'id' | 'createdAt'>,
): Promise<number> {
  return db.resource.add({
    ...resource,
    createdAt: Date.now(),
  });
}

export async function updateResource(
  resourceId: number,
  changes: Partial<Resource>,
): Promise<void> {
  await db.resource.update(resourceId, changes);
}

export async function deleteResource(resourceId: number): Promise<void> {
  await db.resource.delete(resourceId);
}
