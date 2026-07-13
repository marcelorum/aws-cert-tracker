import { useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './schema';
import type { Domain, Topic, Resource } from '../lib/types';
import { calcExamPace, type ExamPaceResult } from '../lib/progress';

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

export interface ExamSchedule {
  targetDate: string | null;
  dateSet: number | null;
  setTargetDate: (date: string) => Promise<void>;
  clearTargetDate: () => Promise<void>;
  daysRemaining: number | null;
  daysElapsed: number | null;
  pace: ExamPaceResult;
}

export function useExamSchedule(): ExamSchedule {
  const exam = useLiveQuery(() => db.exam.get(1), [], undefined);
  const allTopics = useAllTopics();

  const targetDate = exam?.targetDate ?? null;
  const dateSet = exam?.dateSet ?? null;

  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter((t) => t.status === 'completed').length;

  const paceResult = useMemo(
    () => calcExamPace({ targetDate, dateSet, totalTopics, completedTopics }),
    [targetDate, dateSet, totalTopics, completedTopics],
  );

  const setTargetDate = useCallback(async (date: string) => {
    await db.exam.update(1, { targetDate: date, dateSet: Date.now() });
  }, []);

  const clearTargetDate = useCallback(async () => {
    await db.exam.update(1, { targetDate: undefined, dateSet: undefined });
  }, []);

  return {
    targetDate,
    dateSet,
    setTargetDate,
    clearTargetDate,
    daysRemaining: paceResult.daysRemaining,
    daysElapsed: paceResult.daysElapsed,
    pace: paceResult,
  };
}
