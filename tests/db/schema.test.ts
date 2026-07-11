import { describe, it, expect, beforeAll } from 'vitest';
import { CLFTrackerDB } from '../../src/db/schema';

describe('CLFTrackerDB', () => {
  let db: CLFTrackerDB;

  beforeAll(() => {
    db = new CLFTrackerDB();
  });

  it('should be an instance of Dexie', () => {
    expect(db).toBeInstanceOf(CLFTrackerDB);
    expect(db.name).toBe('CLFTrackerDB');
  });

  it('should define the exam table with correct schema', () => {
    expect(db.exam).toBeDefined();
    const schema = db.table('exam');
    expect(schema.schema.primKey.name).toBe('id');
    expect(schema.schema.primKey.auto).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'name')).toBe(true);
  });

  it('should define the domain table with correct schema', () => {
    expect(db.domain).toBeDefined();
    const schema = db.table('domain');
    expect(schema.schema.primKey.name).toBe('id');
    expect(schema.schema.primKey.auto).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'examId')).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'weight')).toBe(true);
  });

  it('should define the topic table with correct schema', () => {
    expect(db.topic).toBeDefined();
    const schema = db.table('topic');
    expect(schema.schema.primKey.name).toBe('id');
    expect(schema.schema.primKey.auto).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'domainId')).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'parentTopicId')).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'status')).toBe(true);
  });

  it('should define the resource table with correct schema', () => {
    expect(db.resource).toBeDefined();
    const schema = db.table('resource');
    expect(schema.schema.primKey.name).toBe('id');
    expect(schema.schema.primKey.auto).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'topicId')).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'resourceType')).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'url')).toBe(true);
    expect(schema.schema.indexes.some((idx) => idx.keyPath === 'createdAt')).toBe(true);
  });

  it('should have version 1', () => {
    expect(db.verno).toBe(1);
  });
});
