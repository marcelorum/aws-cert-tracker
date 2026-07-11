import Dexie, { type Table } from 'dexie';
import type { Exam, Domain, Topic, Resource } from '../lib/types';

export class CLFTrackerDB extends Dexie {
  exam!: Table<Exam, number>;
  domain!: Table<Domain, number>;
  topic!: Table<Topic, number>;
  resource!: Table<Resource, number>;

  constructor() {
    super('CLFTrackerDB');
    this.version(1).stores({
      exam: '++id, name',
      domain: '++id, examId, weight',
      topic: '++id, domainId, parentTopicId, status',
      resource: '++id, topicId, resourceType, url, createdAt',
    });
  }
}

export const db = new CLFTrackerDB();
