export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export type ResourceType = 'video' | 'article' | 'practice_exam' | 'aws_doc' | 'note' | 'flashcard';

export interface Exam {
  id?: number;
  name: string;
  code: string;
  targetDate?: string; // YYYY-MM-DD format
  dateSet?: number;    // timestamp when targetDate was set
}

export interface Domain {
  id?: number;
  examId: number;
  name: string;
  weight: number;
  order: number;
}

export interface Topic {
  id?: number;
  domainId: number;
  parentTopicId?: number;
  name: string;
  description: string;
  order: number;
  status: TopicStatus;
}

export interface Resource {
  id?: number;
  topicId: number;
  resourceType: ResourceType;
  title: string;
  url?: string;
  notes?: string;
  createdAt: number;
}

export const TOPIC_STATUS_LABELS: Record<TopicStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  video: 'Video',
  article: 'Article',
  practice_exam: 'Practice Exam',
  aws_doc: 'AWS Documentation',
  note: 'Note',
  flashcard: 'Flashcard',
};

export const NEXT_STATUS: Record<TopicStatus, TopicStatus> = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'not_started',
};

export const STATUS_CYCLE: TopicStatus[] = ['not_started', 'in_progress', 'completed'];
